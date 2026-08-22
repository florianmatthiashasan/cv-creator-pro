import { CVData, CVTemplate, Experience } from '@/types/cv';

export type JobMatchSuggestion = {
  id: string;
  label: string;
  issue: string;
  suggestion: string;
  target: 'summary' | 'skills' | 'experience';
  experienceId?: string;
};

export type JobMatchReport = {
  score: number;
  label: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  role: string;
  company: string;
  suggestions: JobMatchSuggestion[];
};

export type AtsCheck = {
  score: number;
  label: string;
  checks: Array<{
    id: string;
    status: 'Pass' | 'Fix' | 'Watch';
    title: string;
    detail: string;
  }>;
};

export type InterviewPrep = {
  role: string;
  company: string;
  questions: Array<{
    question: string;
    answerAngle: string;
  }>;
};

const stopWords = new Set([
  'about',
  'above',
  'after',
  'also',
  'and',
  'are',
  'auf',
  'bei',
  'can',
  'das',
  'der',
  'die',
  'ein',
  'eine',
  'for',
  'from',
  'has',
  'have',
  'how',
  'ich',
  'mit',
  'not',
  'our',
  'out',
  'per',
  'the',
  'this',
  'und',
  'von',
  'was',
  'werden',
  'will',
  'with',
  'you',
  'your',
]);

const importantPhrases = [
  'project management',
  'stakeholder management',
  'data analysis',
  'customer success',
  'supply chain',
  'team leadership',
  'process improvement',
  'change management',
  'cross functional',
  'machine learning',
  'business development',
  'quality assurance',
  'risk management',
  'product management',
  'agile',
  'scrum',
  'react',
  'typescript',
  'python',
  'sql',
  'excel',
  'sap',
  'salesforce',
  'figma',
  'aws',
  'azure',
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}+#.-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => (part.length <= 3 && /^[a-z+#.]+$/i.test(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');

const tokenise = (value: string) =>
  normalize(value)
    .split(' ')
    .map((word) => word.replace(/^[^a-z0-9+#.]+|[^a-z0-9+#.]+$/gi, ''))
    .filter((word) => word.length >= 3 && !stopWords.has(word));

const unique = <T>(items: T[]) => Array.from(new Set(items));

export const getCvPlainText = (data: CVData) =>
  [
    data.personalInfo.title,
    data.personalInfo.summary,
    data.experiences.map((item) => `${item.position} ${item.company} ${item.description}`).join(' '),
    data.education.map((item) => `${item.degree} ${item.field} ${item.institution} ${item.description || ''}`).join(' '),
    data.skills.map((item) => item.name).join(' '),
    data.languages.map((item) => item.name).join(' '),
    (data.additionalSections || [])
      .map((item) => `${item.title} ${item.organization} ${item.description} ${item.url || ''}`)
      .join(' '),
  ].join(' ');

export const extractKeywords = (value: string, limit = 16) => {
  const normalized = normalize(value);
  const phraseMatches = importantPhrases.filter((phrase) => normalized.includes(phrase));
  const counts = tokenise(value).reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  const ranked = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([keyword]) => keyword)
    .filter((keyword) => !phraseMatches.some((phrase) => phrase.includes(keyword)));

  return unique([...phraseMatches, ...ranked]).slice(0, limit).map(titleCase);
};

const hasMetric = (text: string) =>
  /\d+([.,]\d+)?%?|\b(k|m|eur|usd|gbp|hours?|days?|weeks?|months?|people|users|clients|routes|orders|tickets|revenue|budget)\b/i.test(text);

const getRoleFromJobAd = (jobAd: string, fallback: string) => {
  const line = jobAd
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.length >= 5 && item.length <= 90 && !/about|benefits|requirements|responsibilities/i.test(item));
  return line || fallback || 'the target role';
};

const getCompanyFromJobAd = (jobAd: string) => {
  const companyLine = jobAd
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /company|unternehmen|firma|employer/i.test(line));
  return companyLine?.replace(/^(company|unternehmen|firma|employer)\s*[:-]\s*/i, '').slice(0, 80) || 'the company';
};

const bestExperience = (experiences: Experience[], keywords: string[]) => {
  const normalizedKeywords = keywords.map(normalize);
  return experiences
    .map((experience) => {
      const text = normalize(`${experience.position} ${experience.company} ${experience.description}`);
      return {
        experience,
        score: normalizedKeywords.filter((keyword) => text.includes(keyword)).length + (hasMetric(text) ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.experience;
};

export const buildJobMatchReport = (cvData: CVData, jobAd: string): JobMatchReport => {
  const jobKeywords = extractKeywords(jobAd, 18);
  const cvText = normalize(getCvPlainText(cvData));
  const matchedKeywords = jobKeywords.filter((keyword) => cvText.includes(normalize(keyword)));
  const missingKeywords = jobKeywords.filter((keyword) => !matchedKeywords.includes(keyword)).slice(0, 8);
  const cvWordCount = tokenise(getCvPlainText(cvData)).length;
  const evidenceSections = [
    cvData.personalInfo.summary.trim(),
    cvData.experiences.some((item) => `${item.position} ${item.company} ${item.description}`.trim()),
    cvData.skills.some((item) => item.name.trim()),
  ].filter(Boolean).length;
  const completenessBoost = [
    cvData.personalInfo.summary,
    cvData.experiences.length ? 'experience' : '',
    cvData.skills.length >= 5 ? 'skills' : '',
    cvData.personalInfo.email,
  ].filter(Boolean).length * 4;
  const rawScore = Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 72 + completenessBoost);
  const evidenceCap = evidenceSections === 0 ? 12 : evidenceSections === 1 ? 38 : evidenceSections === 2 ? 68 : 92;
  const lengthCap = cvWordCount < 20 ? 18 : cvWordCount < 60 ? 42 : cvWordCount < 140 ? 72 : 96;
  const score = Math.max(0, Math.min(98, evidenceCap, lengthCap, rawScore));
  const role = getRoleFromJobAd(jobAd, cvData.personalInfo.title);
  const company = getCompanyFromJobAd(jobAd);
  const skillsToAdd = missingKeywords.slice(0, 4);
  const experience = bestExperience(cvData.experiences, matchedKeywords.concat(missingKeywords));
  const topMatched = matchedKeywords.slice(0, 3);
  const suggestions: JobMatchSuggestion[] = [];

  if (missingKeywords.length || cvData.personalInfo.summary.length < 80) {
    suggestions.push({
      id: 'job-summary',
      label: 'Summary',
      issue: 'Make the profile read closer to the job ad.',
      target: 'summary',
      suggestion: `${cvData.personalInfo.title || 'Professional'} targeting ${role} with experience in ${topMatched.concat(skillsToAdd).slice(0, 5).join(', ') || 'relevant delivery work'}. Focused on measurable outcomes, clear communication, and practical execution for ${company}.`,
    });
  }

  if (skillsToAdd.length) {
    suggestions.push({
      id: 'job-skills',
      label: 'Skills',
      issue: 'Add missing job keywords as skills where they are truthful.',
      target: 'skills',
      suggestion: skillsToAdd.join(', '),
    });
  }

  if (experience && missingKeywords.length) {
    suggestions.push({
      id: `job-experience-${experience.id}`,
      label: experience.position || 'Experience',
      issue: 'Tune one role description toward the posting.',
      target: 'experience',
      experienceId: experience.id,
      suggestion: `${experience.description.replace(/[.]+$/, '') || `Delivered ${experience.position || 'role'} work at ${experience.company || 'the company'}`}. Connected work to ${missingKeywords.slice(0, 3).join(', ')} with clear ownership and measurable follow-through.`,
    });
  }

  return {
    score,
    label: score >= 82 ? 'Strong match' : score >= 62 ? 'Good base, tailor it' : 'Needs tailoring',
    matchedKeywords: matchedKeywords.slice(0, 10),
    missingKeywords,
    role,
    company,
    suggestions,
  };
};

export const buildAtsCheck = (cvData: CVData, template: CVTemplate, jobAd = ''): AtsCheck => {
  const jobReport = jobAd.trim().length >= 40 ? buildJobMatchReport(cvData, jobAd) : null;
  const text = getCvPlainText(cvData);
  const words = tokenise(text).length;
  const hasContact = Boolean(cvData.personalInfo.email && (cvData.personalInfo.firstName || cvData.personalInfo.lastName));
  const hasEvidence = cvData.experiences.some((experience) => hasMetric(experience.description));
  const hasReadableTemplate = !['creative', 'grid', 'studio'].includes(template);
  const checks: AtsCheck['checks'] = [
    {
      id: 'contact',
      status: hasContact ? 'Pass' : 'Fix',
      title: 'Contact details',
      detail: hasContact ? 'Name and email are present.' : 'Add name and email before applying.',
    },
    {
      id: 'sections',
      status: cvData.experiences.length && cvData.skills.length ? 'Pass' : 'Fix',
      title: 'Core sections',
      detail: cvData.experiences.length && cvData.skills.length ? 'Experience and skills are visible.' : 'ATS systems need clear experience and skill sections.',
    },
    {
      id: 'keywords',
      status: !jobReport ? 'Watch' : jobReport.missingKeywords.length <= 3 ? 'Pass' : 'Fix',
      title: 'Job keywords',
      detail: !jobReport
        ? 'Paste a job ad to check keyword coverage.'
        : jobReport.missingKeywords.length
          ? `Missing: ${jobReport.missingKeywords.slice(0, 5).join(', ')}.`
          : 'Important job keywords are covered.',
    },
    {
      id: 'evidence',
      status: hasEvidence ? 'Pass' : 'Watch',
      title: 'Measurable achievements',
      detail: hasEvidence ? 'At least one role includes numbers or measurable scope.' : 'Add numbers, scale, budget, team size, or percent impact.',
    },
    {
      id: 'length',
      status: words >= 120 && words <= 850 ? 'Pass' : 'Watch',
      title: 'Readable length',
      detail: words < 120 ? 'The CV is still thin for screening.' : words > 850 ? 'The CV may be too dense for a quick scan.' : 'Content length is in a practical range.',
    },
    {
      id: 'layout',
      status: hasReadableTemplate ? 'Pass' : 'Watch',
      title: 'ATS-friendly layout',
      detail: hasReadableTemplate ? 'The selected template is simple enough for most parsers.' : 'Consider Modern, Classic, Minimal, Compact, or Mono for parser-heavy portals.',
    },
  ];
  const score = Math.round((checks.filter((item) => item.status === 'Pass').length / checks.length) * 100);

  return {
    score,
    label: score >= 82 ? 'ATS ready' : score >= 62 ? 'Mostly ready' : 'Needs fixes',
    checks,
  };
};

export const buildInterviewPrep = (cvData: CVData, jobAd: string): InterviewPrep => {
  const report = buildJobMatchReport(cvData, jobAd);
  const topExperience = bestExperience(cvData.experiences, report.matchedKeywords.concat(report.missingKeywords));
  const proof = topExperience
    ? `${topExperience.position || 'your role'} at ${topExperience.company || 'a previous company'}`
    : cvData.personalInfo.summary || 'your strongest relevant experience';
  const skills = cvData.skills.map((skill) => skill.name).filter(Boolean).slice(0, 4).join(', ') || 'your relevant skills';

  return {
    role: report.role,
    company: report.company,
    questions: [
      {
        question: `Why are you interested in ${report.role}?`,
        answerAngle: `Connect the role to ${skills}, then name one concrete problem you want to help ${report.company} solve.`,
      },
      {
        question: 'Tell me about a relevant achievement from your CV.',
        answerAngle: `Use STAR: situation in ${proof}, task you owned, action you took, measurable result.`,
      },
      {
        question: `Which requirement for ${report.role} is your strongest match?`,
        answerAngle: `Lead with ${report.matchedKeywords.slice(0, 3).join(', ') || skills}, then give one example from a role or project.`,
      },
      {
        question: 'Where would you need onboarding or support?',
        answerAngle: `Be honest about ${report.missingKeywords[0] || 'the company-specific context'}, then show how you learn quickly.`,
      },
      {
        question: 'What would you do in your first 30 days?',
        answerAngle: 'Listen to stakeholders, map current workflows, identify quick wins, and agree on success metrics.',
      },
    ],
  };
};

export const buildTailoredCvData = (cvData: CVData, report: JobMatchReport): CVData => {
  const skillsToAdd = report.missingKeywords
    .slice(0, 4)
    .filter((keyword) => !cvData.skills.some((skill) => normalize(skill.name) === normalize(keyword)));
  const experienceSuggestion = report.suggestions.find((item) => item.target === 'experience');

  return {
    ...cvData,
    personalInfo: {
      ...cvData.personalInfo,
      summary: report.suggestions.find((item) => item.target === 'summary')?.suggestion || cvData.personalInfo.summary,
    },
    skills: [
      ...cvData.skills,
      ...skillsToAdd.map((keyword) => ({
        id: crypto.randomUUID(),
        name: keyword,
        level: 3,
      })),
    ],
    experiences: experienceSuggestion?.experienceId
      ? cvData.experiences.map((experience) =>
          experience.id === experienceSuggestion.experienceId
            ? { ...experience, description: experienceSuggestion.suggestion }
            : experience,
        )
      : cvData.experiences,
  };
};
