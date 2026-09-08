import { createClient, type User } from '@supabase/supabase-js';

const activeSubscriptionStatuses = new Set(['active', 'trialing']);

// Stripe can end a subscription immediately (status 'canceled', ended_at set) even though the
// period the customer already paid for runs on. A weekly subscriber who cancels on day one has
// paid for that week and keeps access until current_period_end. Deliberately excludes
// 'past_due' and 'unpaid': there the current period's invoice is unpaid, so nothing is owed.
// PostgREST may hand back "2026-09-15 13:15:28+00" rather than ISO-8601: a space instead of
// "T", and a two-digit offset that Date.parse rejects outright (yielding NaN).
const parseTimestamp = (value: string) =>
  Date.parse(value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'));

const hasPaidPeriodRemaining = (status: string | null, currentPeriodEnd: string | null) => {
  if (status !== 'canceled' || !currentPeriodEnd) return false;
  const endsAt = parseTimestamp(currentPeriodEnd);
  return Number.isFinite(endsAt) && endsAt > Date.now();
};

export type SubscriptionState = {
  isActive: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const getSupabaseUrl = () => process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseAnonKey = () =>
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || '';
};

export const createServiceSupabaseClient = () => {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const getAuthenticatedUser = async (request: Request): Promise<{ user: User | null; error?: string }> => {
  const token = getBearerToken(request);
  if (!token) return { user: null, error: 'Login required.' };

  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !anonKey) return { user: null, error: 'Supabase is not configured on the server.' };

  const supabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, error: 'Login required.' };
  return { user: data.user };
};

export const fetchServerSubscriptionState = async (userId: string): Promise<SubscriptionState> => {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return {
      isActive: false,
      status: 'server_not_configured',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('status,current_period_end,cancel_at_period_end,stripe_customer_id,stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      isActive: false,
      status: error ? 'missing_subscription_table_or_row' : null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
  }

  const status = typeof data.status === 'string' ? data.status : null;
  const currentPeriodEnd = typeof data.current_period_end === 'string' ? data.current_period_end : null;
  return {
    isActive: Boolean(
      status && (activeSubscriptionStatuses.has(status) || hasPaidPeriodRemaining(status, currentPeriodEnd)),
    ),
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
    stripeCustomerId: typeof data.stripe_customer_id === 'string' ? data.stripe_customer_id : null,
    stripeSubscriptionId: typeof data.stripe_subscription_id === 'string' ? data.stripe_subscription_id : null,
  };
};

export const requireActiveSubscription = async (request: Request) => {
  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return { user: null, response: json({ error: error || 'Login required.' }, 401) };

  const subscription = await fetchServerSubscriptionState(user.id);
  if (!subscription.isActive) {
    return {
      user,
      response: json(
        {
          error: 'Folio CV Pro is required for AI features.',
          code: 'subscription_required',
          subscription,
        },
        402,
      ),
    };
  }

  return { user, subscription };
};
