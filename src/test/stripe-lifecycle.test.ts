// @vitest-environment node
import Stripe from 'stripe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
const db = vi.hoisted(() => ({ rows: {} as Record<string, Row[]>, failingTable: '' }));
const stripeMock = vi.hoisted(() => ({ retrieve: vi.fn(), retrieveCheckout: vi.fn(), update: vi.fn(), generateLink: vi.fn() }));

// Exercise the real handlers and billing/access code with an in-memory persistence boundary.
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user_1' } }, error: null }),
      admin: { generateLink: stripeMock.generateLink },
    },
    from: (table: string) => {
      const filters: Array<[string, unknown]> = [];
      let operation = 'select';
      let payload: Row = {};
      const execute = () => {
        if (db.failingTable === table) return { data: null, error: new Error('Database unavailable') };
        const rows = db.rows[table] ??= [];
        const matches = (row: Row) => filters.every(([key, value]) => row[key] === value);
        if (operation === 'upsert') {
          const existing = rows.find((row) => row.user_id === payload.user_id);
          if (existing) Object.assign(existing, payload);
          else rows.push({ ...payload });
        } else if (operation === 'update') {
          rows.filter(matches).forEach((row) => Object.assign(row, payload));
        }
        return { data: rows.find(matches) ?? null, error: null };
      };
      const query = {
        select: () => query,
        eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
        maybeSingle: async () => execute(),
        upsert: (value: Row) => { operation = 'upsert'; payload = value; return query; },
        update: (value: Row) => { operation = 'update'; payload = value; return query; },
        then: (resolve: (value: ReturnType<typeof execute>) => unknown, reject: (error: unknown) => unknown) =>
          Promise.resolve(execute()).then(resolve, reject),
      };
      return query;
    },
  }),
}));

vi.mock('../../api/_stripe.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../api/_stripe.js')>();
  return {
    ...original,
    getStripe: () => ({
      subscriptions: { retrieve: stripeMock.retrieve, update: stripeMock.update },
      checkout: { sessions: { retrieve: stripeMock.retrieveCheckout } },
      webhooks: new Stripe('sk_test_local_fixture').webhooks,
    }),
  };
});

import { upsertSubscription } from '../../api/_billing';
import { fetchServerSubscriptionState, requireActiveSubscription } from '../../api/_supabase-server';
import { fetch as webhook } from '../../api/stripe-webhook';
import { fetch as cancel } from '../../api/stripe-cancel-subscription';
import { fetch as status } from '../../api/stripe-subscription-status';
import { fetch as checkoutSuccess } from '../../api/stripe-checkout-success';

const now = Date.parse('2026-10-15T12:00:00Z');
const seconds = now / 1000;
const week = 7 * 86400;
const secret = 'whsec_local_fixture';
let current: Stripe.Subscription;

const makeSubscription = (overrides: Row = {}) => ({
  id: 'sub_weekly', customer: 'cus_1', status: 'active', created: seconds,
  metadata: { userId: 'user_1' }, cancel_at_period_end: false, cancel_at: null, trial_end: null,
  items: { data: [{ price: { id: 'price_weekly' }, current_period_start: seconds, current_period_end: seconds + week }] },
  ...overrides,
} as unknown as Stripe.Subscription);

const authenticatedRequest = (path: string, body?: Row) => new Request(`https://app.invalid/api/${path}`, {
  method: body ? 'POST' : 'GET',
  headers: { authorization: 'Bearer fixture', 'content-type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

const sendEvent = (type: string, object: unknown) => {
  const payload = JSON.stringify({ id: 'evt_fixture', type, data: { object } });
  const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return webhook(new Request('https://app.invalid/api/stripe-webhook', {
    method: 'POST', body: payload, headers: { 'stripe-signature': signature },
  }));
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(now);
  vi.stubEnv('VITE_SUPABASE_URL', 'https://db.invalid');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'fixture');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', secret);
  db.rows = {};
  db.failingTable = '';
  current = makeSubscription();
  stripeMock.retrieve.mockReset().mockImplementation(async () => structuredClone(current));
  stripeMock.update.mockReset().mockImplementation(async (_id: string, update: { cancel_at_period_end: boolean }) => {
    current = { ...current, cancel_at_period_end: update.cancel_at_period_end,
      cancel_at: update.cancel_at_period_end ? current.items.data[0].current_period_end : null };
    return structuredClone(current);
  });
  stripeMock.generateLink.mockReset();
  stripeMock.retrieveCheckout.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Stripe subscription lifecycle', () => {
  it.each([7, 30, 365])('expires a stale active %i-day record and denies server-side Pro requests', async (days) => {
    current = makeSubscription({ items: { data: [{ current_period_end: seconds + days * 86400 }] } });
    await upsertSubscription(current);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(true);
    vi.setSystemTime((seconds + days * 86400) * 1000);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
    const gate = await requireActiveSubscription(authenticatedRequest('ai-career-advisor'));
    expect('response' in gate && gate.response?.status).toBe(402);
  });

  it('cancels at period end, preserves paid time and denies access exactly at expiry', async () => {
    await upsertSubscription(current);
    const response = await cancel(authenticatedRequest('stripe-cancel-subscription', { resume: false }));
    expect(response.status).toBe(200);
    expect(stripeMock.update).toHaveBeenCalledWith('sub_weekly', { cancel_at_period_end: true });
    expect(await response.json()).toMatchObject({ isActive: true, cancelAtPeriodEnd: true });
    vi.setSystemTime((seconds + week) * 1000 - 1);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(true);
    vi.setSystemTime((seconds + week) * 1000);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
  });

  it('resumes a pending cancellation and clears an explicit cancellation date', async () => {
    current = makeSubscription({ cancel_at_period_end: true, cancel_at: seconds + 3600 });
    await upsertSubscription(current);
    const response = await cancel(authenticatedRequest('stripe-cancel-subscription', { resume: true }));
    expect(stripeMock.update).toHaveBeenCalledWith('sub_weekly', { cancel_at_period_end: false, cancel_at: '' });
    expect(await response.json()).toMatchObject({ isActive: true, cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date((seconds + week) * 1000).toISOString() });
  });

  it('extends access on invoice.paid using the current invoice subscription field', async () => {
    await upsertSubscription(current);
    vi.setSystemTime((seconds + week) * 1000);
    current = makeSubscription({ items: { data: [{ price: { id: 'price_weekly' },
      current_period_start: seconds + week, current_period_end: seconds + 2 * week }] } });
    expect((await sendEvent('invoice.paid', { parent: { subscription_details: { subscription: current.id } } })).status).toBe(200);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(true);
  });

  it.each(['past_due', 'unpaid', 'incomplete', 'paused', 'canceled'])(
    'revokes Pro for %s despite a future period end', async (subscriptionStatus) => {
      await upsertSubscription(current);
      current = makeSubscription({ status: subscriptionStatus });
      const response = await sendEvent('invoice.payment_failed', {
        parent: { subscription_details: { subscription: { id: current.id } } },
      });
      expect(response.status).toBe(200);
      expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
    },
  );

  it('handles legacy invoice.subscription events', async () => {
    await upsertSubscription(current);
    current = makeSubscription({ status: 'past_due' });
    await sendEvent('invoice.payment_failed', { subscription: current.id });
    expect((await fetchServerSubscriptionState('user_1')).status).toBe('past_due');
  });

  it('updates guest subscriptions without user metadata via persisted customer ownership', async () => {
    db.rows.user_billing = [{ user_id: 'user_1', stripe_customer_id: 'cus_1' }];
    current = makeSubscription({ metadata: {}, customer: { id: 'cus_1' }, cancel_at_period_end: true });
    expect((await sendEvent('customer.subscription.updated', current)).status).toBe(200);
    expect(await fetchServerSubscriptionState('user_1')).toMatchObject({ isActive: true, cancelAtPeriodEnd: true });
    current = { ...current, status: 'canceled' };
    await sendEvent('customer.subscription.deleted', current);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
  });

  it('uses the latest Stripe state when an older active snapshot arrives after cancellation', async () => {
    await upsertSubscription(current);
    const oldSnapshot = structuredClone(current);
    current = makeSubscription({ status: 'canceled' });
    await sendEvent('customer.subscription.updated', oldSnapshot);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
  });

  it('does not overwrite a new purchase with a terminal event for the old purchase', async () => {
    await upsertSubscription(current);
    const old = makeSubscription({ status: 'canceled' });
    await upsertSubscription(makeSubscription({ id: 'sub_new', customer: 'cus_new' }));
    await upsertSubscription(old);
    expect(await fetchServerSubscriptionState('user_1')).toMatchObject({ isActive: true,
      stripeSubscriptionId: 'sub_new', stripeCustomerId: 'cus_new' });
    expect(db.rows.user_billing[0].stripe_customer_id).toBe('cus_new');
  });

  it('limits access to an explicit cancellation date or trial end', async () => {
    await upsertSubscription(makeSubscription({ cancel_at: seconds + 100 }));
    expect((await fetchServerSubscriptionState('user_1')).currentPeriodEnd).toBe(new Date(now + 100_000).toISOString());
    await upsertSubscription(makeSubscription({ status: 'trialing', trial_end: seconds + 50 }));
    vi.setSystemTime(now + 50_000);
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(false);
  });

  it('reconciles a missed renewal webhook through the status endpoint', async () => {
    await upsertSubscription(current);
    vi.setSystemTime((seconds + week) * 1000);
    current = makeSubscription({ items: { data: [{ current_period_end: seconds + 2 * week }] } });
    const response = await status(authenticatedRequest('stripe-subscription-status'));
    expect(await response.json()).toMatchObject({ isActive: true });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps expired access revoked when Stripe cannot be reached', async () => {
    await upsertSubscription(current);
    vi.setSystemTime((seconds + week) * 1000);
    stripeMock.retrieve.mockRejectedValue(new Error('Stripe unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await (await status(authenticatedRequest('stripe-subscription-status'))).json()).toMatchObject({ isActive: false });
  });

  it('returns a retryable webhook failure on database errors', async () => {
    db.failingTable = 'user_subscriptions';
    expect((await sendEvent('customer.subscription.updated', current)).status).toBe(500);
  });

  it('rejects an invalid webhook signature', async () => {
    const response = await webhook(new Request('https://app.invalid/api/stripe-webhook', {
      method: 'POST', body: '{}', headers: { 'stripe-signature': 'invalid' },
    }));
    expect(response.status).toBe(400);
    expect(stripeMock.retrieve).not.toHaveBeenCalled();
  });

  it('does not provision an unpaid Checkout session', async () => {
    await sendEvent('checkout.session.completed', { subscription: current.id, payment_status: 'unpaid' });
    expect(stripeMock.retrieve).not.toHaveBeenCalled();
    expect(db.rows.user_subscriptions).toBeUndefined();
  });

  it('provisions an asynchronous payment only after payment succeeds', async () => {
    await sendEvent('checkout.session.async_payment_succeeded', {
      subscription: current.id, payment_status: 'paid', client_reference_id: 'user_1',
    });
    expect((await fetchServerSubscriptionState('user_1')).isActive).toBe(true);
  });

  it('does not generate a login link for an unpaid Checkout return', async () => {
    stripeMock.retrieveCheckout.mockResolvedValue({ status: 'complete', payment_status: 'unpaid',
      subscription: current.id, customer_details: { email: 'buyer@example.com' } });
    const response = await checkoutSuccess(new Request('https://app.invalid/api/stripe-checkout-success?session_id=cs_fixture'));
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://app.invalid/?checkout=pending');
    expect(stripeMock.generateLink).not.toHaveBeenCalled();
    expect(stripeMock.retrieve).not.toHaveBeenCalled();
  });
});
