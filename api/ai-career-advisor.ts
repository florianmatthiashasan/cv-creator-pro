export const config = {
  runtime: 'edge',
};

import { requireActiveSubscription } from './_supabase-server';

type CareerAdvisorMode = 'cv-review' | 'job-match' | 'tailored-cv';

type CareerAdvisorPayload = {
  mode?: CareerAdvisorMode;
  cvData?: unknown;
  template?: string;
  jobAd?: string;
  outputLanguage?: 'English' | 'German';
  localReview?: unknown;
  localJobMatch?: unknown;
  localAtsCheck?: unknown;
  localInterviewPrep?: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const extractOutputText = (data: unknown) => {
  if (!data || typeof data !== 'object') return '';
  const outputText = (data as { output_text?: unknown }).output_text;
  if (typeof outputText === 'string') return outputText;

  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return '';

  return output
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const text = (item as { text?: unknown }).text;
      return typeof text === 'string' ? text : '';
    })
    .filter(Boolean)
    .join('\n');
};

const sharedString = { type: 'string' };
const score = { type: 'number', minimum: 0, maximum: 100 };
const textValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const toArray = (value: unknown) => (Array.isArray(value) ? value : []);
const dataUrlPattern = /data:[^"'\s]+/g;
const truncateText = (value: unknown, maxLength: number) =>
  textValue(value)
    .replace(dataUrlPattern, '[removed uploaded file]')
    .slice(0, maxLength);
const compactJson = (value: unknown, maxLength: number) => {
  const text = JSON.stringify(value ?? {}, null, 2).replace(dataUrlPattern, '[removed uploaded file]');
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n[truncated]` : text;
};
const normaliseText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}+#.-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const tokenise = (value: string) =>
  normaliseText(value)
    .split(' ')
    .filter((word) => word.length >= 3);

const cvPlainText = (cvData: unknown) => {
  if (!cvData || typeof cvData !== 'object') return '';
  const data = cvData as Record<string, unknown>;
  const personalInfo = (data.personalInfo && typeof data.personalInfo === 'object' ? data.personalInfo : {}) as Record<string, unknown>;
  const experiences = toArray(data.experiences).map((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return [row.position, row.company, row.description].map(textValue).join(' ');
  });
  const education = toArray(data.education).map((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return [row.degree, row.field, row.institution, row.description].map(textValue).join(' ');
  });
  const skills = toArray(data.skills).map((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return textValue(row.name);
  });
  const languages = toArray(data.languages).map((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return textValue(row.name);
  });
  const additionalSections = toArray(data.additionalSections).map((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return [row.title, row.organization, row.description].map(textValue).join(' ');
  });

  return [
    personalInfo.title,
    personalInfo.summary,
    personalInfo.address,
    ...experiences,
    ...education,
    ...skills,
    ...languages,
    ...additionalSections,
  ].map(textValue).join(' ');
};

const getCvEvidenceStats = (cvData: unknown, jobAd = '') => {
  if (!cvData || typeof cvData !== 'object') {
    return { wordCount: 0, overlapRatio: 0, directMatches: 0, scoreCap: 18 };
  }

  const data = cvData as Record<string, unknown>;
  const personalInfo = (data.personalInfo && typeof data.personalInfo === 'object' ? data.personalInfo : {}) as Record<string, unknown>;
  const experiences = toArray(data.experiences);
  const skills = toArray(data.skills);
  const cvText = cvPlainText(cvData);
  const cvTokens = new Set(tokenise(cvText));
  const jobTokens = tokenise(jobAd).filter((word) => !new Set([
    'the', 'and', 'for', 'with', 'you', 'your', 'our', 'are', 'und', 'der', 'die', 'das', 'mit', 'für', 'eine', 'ein',
  ]).has(word));
  const uniqueJobTokens = Array.from(new Set(jobTokens)).slice(0, 80);
  const directMatches = uniqueJobTokens.filter((word) => cvTokens.has(word)).length;
  const overlapRatio = uniqueJobTokens.length ? directMatches / uniqueJobTokens.length : 0;
  const wordCount = tokenise(cvText).length;
  const hasSummary = Boolean(textValue(personalInfo.summary));
  const hasExperienceText = experiences.some((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return Boolean(textValue(row.position) || textValue(row.company) || textValue(row.description));
  });
  const skillCount = skills.filter((item) => {
    const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return Boolean(textValue(row.name));
  }).length;
  const evidenceSections = [hasSummary, hasExperienceText, skillCount >= 3].filter(Boolean).length;
  const baseCap = evidenceSections === 0 ? 12 : evidenceSections === 1 ? 38 : evidenceSections === 2 ? 68 : 92;
  const wordCap = wordCount < 20 ? 18 : wordCount < 60 ? 42 : wordCount < 140 ? 72 : 96;
  const overlapCap = overlapRatio < 0.05 ? 30 : overlapRatio < 0.14 ? 55 : overlapRatio < 0.28 ? 78 : 96;
  const scoreCap = Math.max(8, Math.min(baseCap, wordCap, overlapCap));

  return { wordCount, overlapRatio, directMatches, scoreCap };
};

const clampScore = (value: unknown, cap: number) => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(Math.min(numeric, cap))));
};

const getOutputLanguage = (payload: CareerAdvisorPayload) =>
  payload.outputLanguage === 'German' ? 'German' : 'English';
const getMaxOutputTokens = (mode?: CareerAdvisorMode) =>
  mode === 'tailored-cv' ? 2200 : mode === 'job-match' ? 1800 : 1200;

const compactCvDataForAi = (cvData: unknown) => {
  if (!cvData || typeof cvData !== 'object') return {};
  const data = cvData as Record<string, unknown>;
  const personalInfo = (data.personalInfo && typeof data.personalInfo === 'object' ? data.personalInfo : {}) as Record<string, unknown>;

  return {
    personalInfo: {
      firstName: truncateText(personalInfo.firstName, 120),
      lastName: truncateText(personalInfo.lastName, 120),
      email: truncateText(personalInfo.email, 160),
      phone: truncateText(personalInfo.phone, 80),
      address: truncateText(personalInfo.address, 240),
      title: truncateText(personalInfo.title, 180),
      summary: truncateText(personalInfo.summary, 1800),
      website: truncateText(personalInfo.website, 240),
      linkedin: truncateText(personalInfo.linkedin, 240),
    },
    experiences: toArray(data.experiences).slice(0, 10).map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: truncateText(row.id, 80),
        company: truncateText(row.company, 180),
        position: truncateText(row.position, 180),
        startDate: truncateText(row.startDate, 40),
        endDate: truncateText(row.endDate, 40),
        current: Boolean(row.current),
        description: truncateText(row.description, 1800),
      };
    }),
    education: toArray(data.education).slice(0, 8).map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: truncateText(row.id, 80),
        institution: truncateText(row.institution, 180),
        degree: truncateText(row.degree, 180),
        field: truncateText(row.field, 180),
        startDate: truncateText(row.startDate, 40),
        endDate: truncateText(row.endDate, 40),
      grade: truncateText(row.grade, 80),
      description: truncateText(row.description, 900),
      status: truncateText(row.endDate, 40) ? 'completed' : 'endDate missing',
      };
    }),
    skills: toArray(data.skills).slice(0, 60).map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: truncateText(row.id, 80),
        name: truncateText(row.name, 120),
        level: typeof row.level === 'number' ? row.level : undefined,
      };
    }),
    languages: toArray(data.languages).slice(0, 20).map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: truncateText(row.id, 80),
        name: truncateText(row.name, 120),
        level: truncateText(row.level, 80),
      };
    }),
    additionalSections: toArray(data.additionalSections).slice(0, 10).map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: truncateText(row.id, 80),
        kind: truncateText(row.kind, 80),
        title: truncateText(row.title, 180),
        organization: truncateText(row.organization, 180),
        startDate: truncateText(row.startDate, 40),
        endDate: truncateText(row.endDate, 40),
        current: Boolean(row.current),
        description: truncateText(row.description, 1200),
        url: truncateText(row.url, 240),
      };
    }),
  };
};

const cvReviewSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'label', 'summary', 'items', 'suggestions', 'notes'],
  properties: {
    score,
    label: sharedString,
    summary: sharedString,
    notes: sharedString,
    items: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'title', 'body'],
        properties: {
          kind: { type: 'string', enum: ['Good', 'Fix', 'Tip'] },
          title: sharedString,
          body: sharedString,
        },
      },
    },
    suggestions: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'label', 'issue', 'current', 'suggestion', 'target', 'experienceId'],
        properties: {
          id: sharedString,
          label: sharedString,
          issue: sharedString,
          current: sharedString,
          suggestion: sharedString,
          target: { type: 'string', enum: ['summary', 'experience'] },
          experienceId: sharedString,
        },
      },
    },
  },
};

const jobSuggestionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'label', 'issue', 'suggestion', 'target', 'experienceId'],
  properties: {
    id: sharedString,
    label: sharedString,
    issue: sharedString,
    suggestion: sharedString,
    target: { type: 'string', enum: ['summary', 'skills', 'experience'] },
    experienceId: sharedString,
  },
};

const jobMatchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['jobMatchReport', 'atsCheck', 'interviewPrep', 'notes'],
  properties: {
    notes: sharedString,
    jobMatchReport: {
      type: 'object',
      additionalProperties: false,
      required: ['score', 'label', 'matchedKeywords', 'missingKeywords', 'role', 'company', 'suggestions'],
      properties: {
        score,
        label: sharedString,
        matchedKeywords: {
          type: 'array',
          maxItems: 12,
          items: sharedString,
        },
        missingKeywords: {
          type: 'array',
          maxItems: 10,
          items: sharedString,
        },
        role: sharedString,
        company: sharedString,
        suggestions: {
          type: 'array',
          maxItems: 6,
          items: jobSuggestionSchema,
        },
      },
    },
    atsCheck: {
      type: 'object',
      additionalProperties: false,
      required: ['score', 'label', 'checks'],
      properties: {
        score,
        label: sharedString,
        checks: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'status', 'title', 'detail'],
            properties: {
              id: sharedString,
              status: { type: 'string', enum: ['Pass', 'Fix', 'Watch'] },
              title: sharedString,
              detail: sharedString,
            },
          },
        },
      },
    },
    interviewPrep: {
      type: 'object',
      additionalProperties: false,
      required: ['role', 'company', 'questions'],
      properties: {
        role: sharedString,
        company: sharedString,
        questions: {
          type: 'array',
          minItems: 4,
          maxItems: 6,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['question', 'answerAngle'],
            properties: {
              question: sharedString,
              answerAngle: sharedString,
            },
          },
        },
      },
    },
  },
};

const tailoredCvSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'role',
    'company',
    'cvName',
    'matchScore',
    'matchLabel',
    'dataUseNote',
    'gapNote',
    'changes',
    'summary',
    'skillsToAdd',
    'experienceRewrites',
  ],
  properties: {
    role: sharedString,
    company: sharedString,
    cvName: sharedString,
    matchScore: score,
    matchLabel: sharedString,
    dataUseNote: sharedString,
    gapNote: sharedString,
    changes: {
      type: 'array',
      maxItems: 8,
      items: sharedString,
    },
    summary: sharedString,
    skillsToAdd: {
      type: 'array',
      maxItems: 10,
      items: sharedString,
    },
    experienceRewrites: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['experienceId', 'description', 'reason'],
        properties: {
          experienceId: sharedString,
          description: sharedString,
          reason: sharedString,
        },
      },
    },
  },
};

const buildPrompt = (payload: CareerAdvisorPayload) => {
  const cv = compactJson(compactCvDataForAi(payload.cvData), 18000);
  const jobAd = truncateText(payload.jobAd || '', 12000);
  const outputLanguage = getOutputLanguage(payload);
  const evidenceStats = getCvEvidenceStats(payload.cvData, payload.jobAd || '');
  const sharedLanguageRules = [
    `Write all user-facing prose in ${outputLanguage}.`,
    'Understand CVs and job ads in any language, including German, English, Turkish, Arabic, Russian, and mixed-language documents.',
    'Do not translate person names, company names, product names, tool names, certifications, degrees, or quoted job titles unless the user-facing label clearly needs localization.',
    'If the CV language differs from the selected output language, analyse the original text normally and write recommendations in the selected output language.',
  ].join('\n');
  const scoreRules = [
    'Score must be evidence-based, not optimistic.',
    'A score can be high only when the CV has direct, written evidence for the job requirements.',
    'Do not use fixed default ranges. Derive the score from actual overlap, seniority evidence, skills, experience depth, measurable impact, and missing requirements.',
    `Server evidence guard: wordCount=${evidenceStats.wordCount}, directKeywordMatches=${evidenceStats.directMatches}, overlapRatio=${evidenceStats.overlapRatio.toFixed(2)}, maximumAllowedScore=${evidenceStats.scoreCap}. Do not exceed maximumAllowedScore.`,
  ].join('\n');

  if (payload.mode === 'cv-review') {
    return [
      'You are a senior European recruiter and CV editor.',
      sharedLanguageRules,
      'Review the CV for real hiring usefulness, ATS readability, clarity, evidence, and role fit.',
      'Be direct and practical. Do not invent employers, degrees, tools, metrics, or experience.',
      'Read dates literally. Education has no current flag: if education.endDate is present, the education is completed; never call it ongoing/current. If education.endDate is empty, say the end date is missing instead of assuming ongoing study.',
      'Suggestions must be paste-ready and must preserve the candidate truth.',
      'For summary suggestions use target "summary" and experienceId as an empty string.',
      'For experience suggestions use target "experience" and a real experience id from the CV.',
      'Keep labels short. Keep each item body specific.',
      `Existing local review baseline:\n${compactJson(payload.localReview, 4000)}`,
      `CV data:\n${cv}`,
    ].join('\n\n');
  }

  if (payload.mode === 'tailored-cv') {
    return [
      'You are a senior European recruiter, ATS specialist, and CV editor.',
      sharedLanguageRules,
      'Create a tailored CV version for the job ad using only facts explicitly present in the CV data.',
      'You may close gaps by reframing existing evidence, moving emphasis, and adding skills only when the CV clearly supports them.',
      'Do not invent employers, degrees, certifications, tools, metrics, seniority, languages, or responsibilities.',
      'Read dates literally. Education has no current flag: if education.endDate is present, treat that school/degree as completed. Never write ongoing/current school unless the CV explicitly says it is current.',
      'If the CV has no personal summary, no experience evidence, and no skills, return an empty summary, no skillsToAdd, no experienceRewrites, a low matchScore, and explain the missing proof in gapNote.',
      'If the job asks for something not evidenced in the CV, say that in gapNote instead of adding it to the CV.',
      scoreRules,
      'summary must be paste-ready and targeted to the role, but truthful.',
      'skillsToAdd must contain concise skill names only, never sentences. Add a skill only if it is directly evidenced by CV summary, experience, education, projects, certificates, or existing skills. Do not add a skill merely because it appears in the job ad.',
      'experienceRewrites must use real experience ids from the CV and preserve the candidate truth.',
      'dataUseNote should briefly say what was used from the CV.',
      'gapNote should briefly say what could not be filled because the CV lacks proof. If nothing important is missing, say so.',
      `Existing AI/local job match baseline:\n${compactJson(payload.localJobMatch, 5000)}`,
      `Existing local ATS baseline:\n${compactJson(payload.localAtsCheck, 3000)}`,
      `CV data:\n${cv}`,
      `Job ad:\n${jobAd}`,
    ].join('\n\n');
  }

  return [
    'You are a senior recruiter, ATS specialist, and application coach for European job applications.',
    sharedLanguageRules,
    'Compare the CV with the job ad. Produce a practical match report, ATS checklist, CV rewrite suggestions, and interview preparation.',
    'Do not invent candidate facts. Missing keywords should be things present in the job ad and absent or weak in the CV.',
    'Read dates literally. Education has no current flag: if education.endDate is present, the education is completed; never call it ongoing/current. If education.endDate is empty, say the end date is missing instead of assuming ongoing study.',
    scoreRules,
    'Suggestions must be truthful, paste-ready, and specific. For skill suggestions, put comma-separated concise skill names only. Suggest a skill only when the CV contains evidence for it outside the job ad.',
    'For summary suggestions use target "summary" and experienceId as an empty string.',
    'For skill suggestions use target "skills" and experienceId as an empty string.',
    'For experience suggestions use target "experience" and a real experience id from the CV.',
    'If a company or role is unclear, infer cautiously from the job ad and say so in notes.',
    `Selected template: ${payload.template || 'unknown'}`,
    `Existing local job match baseline:\n${compactJson(payload.localJobMatch, 5000)}`,
    `Existing local ATS baseline:\n${compactJson(payload.localAtsCheck, 3000)}`,
    `Existing local interview baseline:\n${compactJson(payload.localInterviewPrep, 3000)}`,
    `CV data:\n${cv}`,
    `Job ad:\n${jobAd}`,
  ].join('\n\n');
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const subscriptionGate = await requireActiveSubscription(request);
  if ('response' in subscriptionGate) return subscriptionGate.response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'OPENAI_API_KEY is not configured on the server.' }, 500);

  const payload = (await request.json()) as CareerAdvisorPayload;
  if (payload.mode !== 'cv-review' && payload.mode !== 'job-match' && payload.mode !== 'tailored-cv') {
    return json({ error: 'Invalid advisor mode.' }, 400);
  }

  if ((payload.mode === 'job-match' || payload.mode === 'tailored-cv') && (!payload.jobAd || payload.jobAd.trim().length < 40)) {
    return json({ error: 'Paste a longer job ad first.' }, 400);
  }

  const schema = payload.mode === 'cv-review'
    ? cvReviewSchema
    : payload.mode === 'tailored-cv'
      ? tailoredCvSchema
      : jobMatchSchema;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CAREER_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: buildPrompt(payload),
      max_output_tokens: getMaxOutputTokens(payload.mode),
      temperature: 0.35,
      text: {
        format: {
          type: 'json_schema',
          name: payload.mode === 'cv-review' ? 'cv_review' : payload.mode === 'tailored-cv' ? 'tailored_cv' : 'job_match',
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) return json({ error: data?.error?.message || 'OpenAI request failed.' }, response.status);

  const text = extractOutputText(data);
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const evidenceStats = getCvEvidenceStats(payload.cvData, payload.jobAd || '');
    if (payload.mode === 'job-match' && parsed.jobMatchReport && typeof parsed.jobMatchReport === 'object') {
      const report = parsed.jobMatchReport as Record<string, unknown>;
      report.score = clampScore(report.score, evidenceStats.scoreCap);
    }
    if (payload.mode === 'tailored-cv') {
      parsed.matchScore = clampScore(parsed.matchScore, evidenceStats.scoreCap);
    }

    return json({
      source: 'openai',
      ...parsed,
    });
  } catch {
    return json({ error: 'OpenAI returned an invalid structured response.' }, 502);
  }
}
