import { CVData } from '@/types/cv';
import { DbApplication } from '@/lib/supabase-db';

const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api';

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags?: unknown;
  job_types?: unknown;
  location: string;
  created_at: number;
};

type ArbeitnowResponse = {
  data: ArbeitnowJob[];
  links?: {
    next?: string | null;
  };
};

type CityCoordinates = {
  lat: number;
  lon: number;
  label: string;
  country: 'AT' | 'CH' | 'DE' | 'NL';
};

const cityCoordinates: Record<string, CityCoordinates> = {
  berlin: { lat: 52.52, lon: 13.405, label: 'Berlin', country: 'DE' },
  hamburg: { lat: 53.5511, lon: 9.9937, label: 'Hamburg', country: 'DE' },
  munich: { lat: 48.1351, lon: 11.582, label: 'Munich', country: 'DE' },
  munchen: { lat: 48.1351, lon: 11.582, label: 'Munich', country: 'DE' },
  cologne: { lat: 50.9375, lon: 6.9603, label: 'Cologne', country: 'DE' },
  koln: { lat: 50.9375, lon: 6.9603, label: 'Cologne', country: 'DE' },
  frankfurt: { lat: 50.1109, lon: 8.6821, label: 'Frankfurt', country: 'DE' },
  stuttgart: { lat: 48.7758, lon: 9.1829, label: 'Stuttgart', country: 'DE' },
  dusseldorf: { lat: 51.2277, lon: 6.7735, label: 'Dusseldorf', country: 'DE' },
  dortmund: { lat: 51.5136, lon: 7.4653, label: 'Dortmund', country: 'DE' },
  essen: { lat: 51.4556, lon: 7.0116, label: 'Essen', country: 'DE' },
  leipzig: { lat: 51.3397, lon: 12.3731, label: 'Leipzig', country: 'DE' },
  bremen: { lat: 53.0793, lon: 8.8017, label: 'Bremen', country: 'DE' },
  dresden: { lat: 51.0504, lon: 13.7373, label: 'Dresden', country: 'DE' },
  hannover: { lat: 52.3759, lon: 9.732, label: 'Hannover', country: 'DE' },
  nuremberg: { lat: 49.4521, lon: 11.0767, label: 'Nuremberg', country: 'DE' },
  nurnberg: { lat: 49.4521, lon: 11.0767, label: 'Nuremberg', country: 'DE' },
  karlsruhe: { lat: 49.0069, lon: 8.4037, label: 'Karlsruhe', country: 'DE' },
  mannheim: { lat: 49.4875, lon: 8.466, label: 'Mannheim', country: 'DE' },
  rotterdam: { lat: 51.9244, lon: 4.4777, label: 'Rotterdam', country: 'NL' },
  amsterdam: { lat: 52.3676, lon: 4.9041, label: 'Amsterdam', country: 'NL' },
  vienna: { lat: 48.2082, lon: 16.3738, label: 'Vienna', country: 'AT' },
  wien: { lat: 48.2082, lon: 16.3738, label: 'Vienna', country: 'AT' },
  innsbruck: { lat: 47.2692, lon: 11.4041, label: 'Innsbruck', country: 'AT' },
  dornbirn: { lat: 47.4125, lon: 9.7417, label: 'Dornbirn', country: 'AT' },
  dorn: { lat: 47.4125, lon: 9.7417, label: 'Dornbirn', country: 'AT' },
  salzburg: { lat: 47.8095, lon: 13.055, label: 'Salzburg', country: 'AT' },
  graz: { lat: 47.0707, lon: 15.4395, label: 'Graz', country: 'AT' },
  linz: { lat: 48.3069, lon: 14.2858, label: 'Linz', country: 'AT' },
  klagenfurt: { lat: 46.6247, lon: 14.3053, label: 'Klagenfurt', country: 'AT' },
  zurich: { lat: 47.3769, lon: 8.5417, label: 'Zurich', country: 'CH' },
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const findCity = (value: string) => {
  const normalizedValue = normalize(value);
  return Object.entries(cityCoordinates)
    .filter(([key]) => normalizedValue.includes(key))
    .sort(([a], [b]) => normalizedValue.lastIndexOf(b) - normalizedValue.lastIndexOf(a))[0]?.[1];
};

export const getProfileCity = (data: CVData) => {
  const address = data.personalInfo.address.trim();
  if (!address) return '';

  const detectedCity = findCity(address);
  if (detectedCity) return detectedCity.label;

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  const candidate = parts[parts.length - 1] || address;
  return candidate.replace(/\b\d{4,6}\b/g, '').trim();
};

const fetchArbeitnowPage = async (page: number) => {
  const response = await fetch(`${ARBEITNOW_API_URL}?page=${page}`);
  if (!response.ok) throw new Error(`Arbeitnow jobs could not be loaded (${response.status})`);
  return (await response.json()) as ArbeitnowResponse;
};

export const fetchArbeitnowJobFromUrl = async (url: string) => {
  const slug = url.split(/[?#]/)[0].split('/').filter(Boolean).pop();
  if (!slug || !url.includes('arbeitnow.')) return null;

  const pages = await Promise.all(
    Array.from({ length: 8 }, (_item, index) => fetchArbeitnowPage(index + 1)),
  );
  const job = pages.flatMap((page) => page.data || []).find((item) => item.slug === slug);
  if (!job) return null;

  const jobTypes = toStringArray(job.job_types);
  const tags = toStringArray(job.tags);

  return {
    id: job.slug,
    title: job.title,
    company: job.company_name,
    location: job.location || (job.remote ? 'Remote' : ''),
    salary: job.remote ? 'Remote' : jobTypes[0] || tags[0] || 'Listed',
    score: '100%',
    stage: 'Saved' as const,
    when: 'just now',
    reason: 'Added from job link',
    sourceUrl: job.url,
  };
};
