import { fetchServerSubscriptionState, getAuthenticatedUser, json } from './_supabase-server';

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  return json(await fetchServerSubscriptionState(user.id));
}
