import { json } from './_supabase-server';
import { getTrialPeriodDays } from './_stripe';

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  return json({
    trialDays: getTrialPeriodDays() || 0,
  });
}
