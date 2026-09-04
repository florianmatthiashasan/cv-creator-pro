export const config = {
  runtime: 'edge',
};

import { requireActiveSubscription } from './_supabase-server';

type WriterPayload = {
  cvProfile?: string;
  jobAd?: string;
  motivation?: string;
  tone?: string;
  language?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const dataUrlPattern = /data:[^"'\s]+/g;
const truncateText = (value: unknown, maxLength: number) =>
  (typeof value === 'string' ? value.trim() : '')
    .replace(dataUrlPattern, '[removed uploaded file]')
    .slice(0, maxLength);

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

const writerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['coverLetter', 'motivation', 'email', 'notes'],
  properties: {
    coverLetter: { type: 'string' },
    motivation: { type: 'string' },
    email: { type: 'string' },
    notes: { type: 'string' },
  },
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const subscriptionGate = await requireActiveSubscription(request);
  if ('response' in subscriptionGate) return subscriptionGate.response;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'OPENAI_API_KEY is not configured on the server.' }, 500);

  const payload = (await request.json()) as WriterPayload;
  const jobAd = truncateText(payload.jobAd, 12000);
  if (jobAd.length < 40) return json({ error: 'Paste a longer job ad first.' }, 400);
  const cvProfile = truncateText(payload.cvProfile, 10000) || 'No CV profile provided.';
  const motivation = truncateText(payload.motivation, 2000) || 'No extra notes provided.';

  const prompt = [
    'You are an expert application writer for European job applications.',
    'Create a complete application package with a cover letter, short motivation answer, application email, and brief notes.',
    'Write all user-facing text in the requested language. Be specific, confident, and natural. Do not invent employers, degrees, metrics, or experience not present in the CV profile or user notes.',
    'Understand CV profiles and job ads in any language, including German, English, Turkish, Arabic, Russian, and mixed-language documents.',
    'Do not translate person names, company names, product names, tool names, certifications, degrees, or quoted job titles unless the requested language clearly requires a localized label.',
    `Language: ${payload.language || 'English'}`,
    `Tone: ${payload.tone || 'Professional'}`,
    `CV profile:\n${cvProfile}`,
    `User motivation notes:\n${motivation}`,
    `Job ad:\n${jobAd}`,
  ].join('\n\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_WRITER_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 1800,
      temperature: 0.45,
      text: {
        format: {
          type: 'json_schema',
          name: 'application_writer',
          strict: true,
          schema: writerSchema,
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) return json({ error: data?.error?.message || 'OpenAI request failed.' }, response.status);

  const text = extractOutputText(data);
  try {
    return json(JSON.parse(text));
  } catch {
    return json({
      coverLetter: text,
      motivation: '',
      email: '',
      notes: 'The model returned text instead of structured JSON.',
    });
  }
}
