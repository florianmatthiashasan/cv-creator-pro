import Stripe from 'stripe';

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

export const getStripePriceId = () => {
  const priceId = process.env.STRIPE_WEEKLY_PRICE_ID || process.env.STRIPE_PRICE_ID_WEEKLY;
  if (!priceId) throw new Error('STRIPE_WEEKLY_PRICE_ID is not configured.');
  return priceId;
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
