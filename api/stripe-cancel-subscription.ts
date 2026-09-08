import { upsertSubscription } from './_billing.js';
import { fetchServerSubscriptionState, getAuthenticatedUser, json } from './_supabase-server.js';
import { getStripe } from './_stripe.js';

async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  const state = await fetchServerSubscriptionState(user.id);
  if (!state.stripeSubscriptionId) {
    return json({ error: 'No subscription found for this account.' }, 404);
  }

  // Stripe rejects updates to a subscription that has already ended, so there is nothing
  // left to schedule — the paid period is either still running or already over.
  if (state.status === 'canceled') {
    return json({ error: 'This subscription has already ended.', code: 'already_canceled', subscription: state }, 409);
  }

  const body = await request.json().catch(() => ({}));
  const resume = (body as { resume?: unknown }).resume === true;

  try {
    const stripe = getStripe();
    // Always cancel at period end: the customer paid for the current period and keeps
    // access until it runs out. Passing resume:true takes a pending cancellation back.
    const subscription = await stripe.subscriptions.update(state.stripeSubscriptionId, {
      cancel_at_period_end: !resume,
    });

    await upsertSubscription(subscription, user.id);
    return json(await fetchServerSubscriptionState(user.id));
  } catch (updateError) {
    console.error('stripe-cancel-subscription failed', updateError);
    return json(
      { error: updateError instanceof Error ? updateError.message : 'Subscription konnte nicht aktualisiert werden.' },
      500,
    );
  }
}

export const fetch = handler;
