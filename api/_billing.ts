import type Stripe from 'stripe';
import type { User } from '@supabase/supabase-js';
import { createServiceSupabaseClient } from './_supabase-server.js';
import { stripeTimestampToIso } from './_stripe.js';
import { hasSubscriptionAccess } from '../src/lib/subscription-access.js';

const getObjectId = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id;
  return null;
};

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

    const users: User[] = data.users;
    const user = users.find((item) => item.email?.toLowerCase() === normalizedEmail);
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

  const stripeCustomerId = getObjectId(subscription.customer);
  if (!stripeCustomerId) return;

  // Guest Checkout subscriptions have no userId metadata. Their later renewal/cancellation
  // events must resolve through the persisted Stripe IDs, not silently get discarded.
  const { data: linkedSubscription, error: subscriptionLookupError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  if (subscriptionLookupError) throw subscriptionLookupError;

  let userId = linkedSubscription?.user_id;
  if (!userId) {
    const { data: billing, error: billingLookupError } = await supabase
      .from('user_billing')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();
    if (billingLookupError) throw billingLookupError;
    userId = billing?.user_id || subscription.metadata?.userId || fallbackUserId;
  }
  if (!userId) return;

  const item = subscription.items.data[0];

  // Since the Basil API, billing periods live on items. Retain legacy event compatibility.
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
  const deadlines = [currentPeriodEnd, subscription.cancel_at,
    subscription.status === 'trialing' ? subscription.trial_end : null]
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const accessEnd = deadlines.length ? stripeTimestampToIso(Math.min(...deadlines)) : null;

  const { data: existing, error: existingError } = await supabase
    .from('user_subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) throw existingError;

  // A delayed terminal event for an older purchase must not replace a newer subscription.
  if (existing && existing.stripe_subscription_id !== subscription.id &&
    !hasSubscriptionAccess(subscription.status, accessEnd)) return;

  const { error: billingError } = await supabase.from('user_billing').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  });
  if (billingError) throw billingError;

  const payload = {
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: item?.price?.id || null,
    current_period_start: stripeTimestampToIso(currentPeriodStart),
    current_period_end: accessEnd,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end || subscription.cancel_at),
  };
  const { error } = existing?.stripe_subscription_id === subscription.id
    ? await supabase.from('user_subscriptions').update(payload)
      .eq('user_id', userId).eq('stripe_subscription_id', subscription.id)
    : await supabase.from('user_subscriptions').upsert(payload);

  if (error) throw error;
};
