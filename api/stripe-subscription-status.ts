import { fetchServerSubscriptionState, getAuthenticatedUser, json } from './_supabase-server.js';
import { upsertSubscription } from './_billing.js';
import { getStripe } from './_stripe.js';

async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  const state = await fetchServerSubscriptionState(user.id);
  if (state.stripeSubscriptionId) {
    try {
      // Reconcile missed/delayed webhooks, including renewals and legacy rows with no dates.
      const subscription = await getStripe().subscriptions.retrieve(state.stripeSubscriptionId);
      await upsertSubscription(subscription, user.id);
      return json(await fetchServerSubscriptionState(user.id));
    } catch (syncError) {
      console.error('stripe-subscription-status sync failed', syncError);
    }
  }
  // During an outage the stored deadline still prevents indefinite Pro access.
  return json(state);
}

export const fetch = handler;
