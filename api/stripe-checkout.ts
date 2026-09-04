import { createServiceSupabaseClient, getAuthenticatedUser, json } from './_supabase-server';
import { getCheckoutUrls, getStripe, getStripePriceId } from './_stripe';

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { user, error } = await getAuthenticatedUser(request);
  if (!user) return json({ error: error || 'Login required.' }, 401);

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const { successUrl, cancelUrl } = getCheckoutUrls(request);
  const supabase = createServiceSupabaseClient();

  let stripeCustomerId: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from('user_billing')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    stripeCustomerId = typeof data?.stripe_customer_id === 'string' ? data.stripe_customer_id : null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      await supabase.from('user_billing').upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId || undefined,
    customer_email: stripeCustomerId ? undefined : user.email || undefined,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
    integration_identifier: `folio_cv_${Math.random().toString(36).slice(2, 10)}`,
  } as Parameters<typeof stripe.checkout.sessions.create>[0]);

  return json({ url: session.url });
}
