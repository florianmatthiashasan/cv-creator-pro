import type Stripe from 'stripe';
import { createServiceSupabaseClient } from './_supabase-server.js';
import { stripeTimestampToIso } from './_stripe.js';

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

  // As of API version 2026-07-29.dahlia the current_period_* fields live on the subscription
  // item, not on the subscription. Reading only the subscription stored null for every row,
  // which in turn made it impossible to tell whether a cancelled subscription still had paid
  // time left. Prefer the item and fall back to the legacy location.
  const itemPeriod = item as typeof item & {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };
  const legacyPeriod = subscription as Stripe.Subscription & {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };
  const currentPeriodStart = itemPeriod?.current_period_start ?? legacyPeriod.current_period_start;
  const currentPeriodEnd = itemPeriod?.current_period_end ?? legacyPeriod.current_period_end;

  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: item?.price?.id || null,
    current_period_start: stripeTimestampToIso(currentPeriodStart),
    current_period_end: stripeTimestampToIso(currentPeriodEnd),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  });

  if (error) throw error;
};
