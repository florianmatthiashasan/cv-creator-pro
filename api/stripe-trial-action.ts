import { getAuthenticatedUser, json } from './_supabase-server';
import { upsertSubscription } from './_billing';
import { createServiceSupabaseClient } from './_supabase-server';
import { getStripe } from './_stripe';

type TrialAction = 'cancel_trial' | 'extend_trial';

const isTrialAction = (value: unknown): value is TrialAction =>
  value === 'cancel_trial' || value === 'extend_trial';

const extensionDaysFromBody = (value: unknown) => {
  const days = Number(value || 2);
  if (!Number.isInteger(days)) return 2;
  return Math.min(Math.max(days, 1), 3);
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  const body = await request.json().catch(() => ({}));
  const action = isTrialAction((body as { action?: unknown }).action) ? (body as { action: TrialAction }).action : null;
  if (!action) return json({ error: 'Unknown trial action.' }, 400);

  const supabase = createServiceSupabaseClient();
  if (!supabase) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, 500);

  const { data, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('stripe_subscription_id,status')
    .eq('user_id', user.id)
    .maybeSingle();

  const subscriptionId = typeof data?.stripe_subscription_id === 'string' ? data.stripe_subscription_id : '';
  if (subscriptionError || !subscriptionId) return json({ error: 'No subscription found for this account.' }, 404);

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== 'trialing') {
    await upsertSubscription(subscription, user.id);
    return json({ error: 'There is no active trial to manage.' }, 409);
  }

  if (action === 'cancel_trial') {
    const canceled = await stripe.subscriptions.cancel(subscriptionId, {
      cancellation_details: {
        comment: 'Trial canceled from Folio CV settings.',
      },
    });
    await upsertSubscription(canceled, user.id);
    return json({
      status: canceled.status,
      trialEnd: typeof canceled.trial_end === 'number' ? new Date(canceled.trial_end * 1000).toISOString() : null,
    });
  }

  if (subscription.metadata?.trial_extension_used === 'true') {
    return json({ error: 'Trial extension was already used for this subscription.' }, 409);
  }

  const extensionDays = extensionDaysFromBody((body as { days?: unknown }).days);
  const now = Math.floor(Date.now() / 1000);
  const currentTrialEnd = typeof subscription.trial_end === 'number' ? subscription.trial_end : now;
  const nextTrialEnd = currentTrialEnd + extensionDays * 24 * 60 * 60;
  const maxTrialEnd = now + 14 * 24 * 60 * 60;

  const updated = await stripe.subscriptions.update(subscriptionId, {
    trial_end: Math.min(nextTrialEnd, maxTrialEnd),
    metadata: {
      ...subscription.metadata,
      trial_extension_used: 'true',
    },
    proration_behavior: 'none',
  });

  await upsertSubscription(updated, user.id);
  return json({
    status: updated.status,
    trialEnd: typeof updated.trial_end === 'number' ? new Date(updated.trial_end * 1000).toISOString() : null,
  });
}
