import Stripe from 'stripe';

export type BillingPlanId = 'weekly' | 'monthly' | 'yearly';

const billingPlanEnv: Record<BillingPlanId, { primary: string; fallback: string }> = {
  weekly: {
    primary: 'STRIPE_WEEKLY_PRICE_ID',
    fallback: 'STRIPE_PRICE_ID_WEEKLY',
  },
  monthly: {
    primary: 'STRIPE_MONTHLY_PRICE_ID',
    fallback: 'STRIPE_PRICE_ID_MONTHLY',
  },
  yearly: {
    primary: 'STRIPE_YEARLY_PRICE_ID',
    fallback: 'STRIPE_PRICE_ID_YEARLY',
  },
};

const isBillingPlanId = (value: unknown): value is BillingPlanId =>
  value === 'weekly' || value === 'monthly' || value === 'yearly';

export const getStripe = () => {
  const apiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('STRIPE_API_KEY is not configured.');

  return new Stripe(apiKey, {
    apiVersion: '2026-07-29.dahlia',
  });
};

export const getOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin) return origin;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
};

export const parseBillingPlanId = (value: unknown): BillingPlanId => {
  if (isBillingPlanId(value)) return value;
  return 'monthly';
};

export const getStripePriceId = (planId: BillingPlanId) => {
  const env = billingPlanEnv[planId];
  const priceId = process.env[env.primary] || process.env[env.fallback];
  if (!priceId) throw new Error(`${env.primary} is not configured.`);
  return priceId;
};

export const getTrialPeriodDays = () => {
  const value = Number(process.env.STRIPE_TRIAL_DAYS || 0);
  if (!Number.isInteger(value) || value < 1) return undefined;
  return Math.min(value, 30);
};

export const getCheckoutUrls = (request: Request) => {
  const origin = getOrigin(request);
  return {
    successUrl: process.env.STRIPE_SUCCESS_URL || `${origin}/dashboard?checkout=success`,
    cancelUrl: process.env.STRIPE_CANCEL_URL || `${origin}/dashboard?checkout=cancel`,
  };
};

export const stripeTimestampToIso = (value?: number | null) =>
  typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
