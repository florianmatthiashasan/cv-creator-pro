import type Stripe from 'stripe';
import { createServiceSupabaseClient } from './_supabase-server';
import { stripeTimestampToIso } from './_stripe';

const getString = (value: unknown) => (typeof value === 'string' ? value : null);

export const getOrCreateBillingUserIdForEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (typeof profile?.id === 'string') return profile.id;

  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user.id;
    if (data.users.length < 1000) break;
    page += 1;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      full_name: normalizedEmail.split('@')[0],
    },
  });
  if (createError) throw createError;
  if (!created.user) return null;

  await supabase.from('profiles').upsert({
    id: created.user.id,
    email: normalizedEmail,
    display_name: normalizedEmail.split('@')[0],
  });

  return created.user.id;
};

export const upsertSubscription = async (subscription: Stripe.Subscription, fallbackUserId?: string | null) => {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');

  const stripeCustomerId = getString(subscription.customer);
  const userId = getString(subscription.metadata?.userId) || fallbackUserId;
  if (!stripeCustomerId || !userId) return;

  await supabase.from('user_billing').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  });

  const item = subscription.items.data[0];
  const period = subscription as Stripe.Subscription & {
    current_period_start?: number | null;
    current_period_end?: number | null;
    trial_start?: number | null;
    trial_end?: number | null;
  };
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: item?.price?.id || null,
    current_period_start: stripeTimestampToIso(period.current_period_start),
    current_period_end: stripeTimestampToIso(period.current_period_end),
    trial_start: stripeTimestampToIso(period.trial_start),
    trial_end: stripeTimestampToIso(period.trial_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  });

  if (error) throw error;
};
