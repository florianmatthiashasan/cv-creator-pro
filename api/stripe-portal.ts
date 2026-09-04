import { fetchServerSubscriptionState, getAuthenticatedUser, json } from './_supabase-server';
import { getOrigin, getStripe } from './_stripe';

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  const subscription = await fetchServerSubscriptionState(user.id);
  if (!subscription.stripeCustomerId) return json({ error: 'No Stripe customer found for this account.' }, 404);

  const stripe = getStripe();
  const origin = getOrigin(request);
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: process.env.STRIPE_PORTAL_RETURN_URL || `${origin}/dashboard`,
  });

  return json({ url: session.url });
}
