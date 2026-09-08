import { createServiceSupabaseClient, getAuthenticatedUser, getBearerToken, json } from './_supabase-server';
import { getCheckoutUrls, getOrigin, getStripe, getStripePriceId, parseBillingPlanId } from './_stripe';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Checkout konnte nicht gestartet werden.';

export default async function handler(request: Request) {
  try {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const token = getBearerToken(request);
    const { user, error } = token ? await getAuthenticatedUser(request) : { user: null, error: undefined };
    if (token && !user) return json({ error: error || 'Login required.' }, 401);

    const body = await request.json().catch(() => ({}));
    const planId = parseBillingPlanId((body as { planId?: unknown }).planId);
    const stripe = getStripe();
    const priceId = getStripePriceId(planId);
    const { successUrl, cancelUrl } = getCheckoutUrls(request);
    const publicSuccessUrl = `${getOrigin(request)}/api/stripe-checkout-success?session_id={CHECKOUT_SESSION_ID}`;
    const supabase = createServiceSupabaseClient();

    let stripeCustomerId: string | null = null;
    if (user && supabase) {
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
      customer_email: stripeCustomerId ? undefined : user?.email || undefined,
      client_reference_id: user?.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: user ? successUrl : publicSuccessUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...(user ? { userId: user.id } : {}),
        planId,
      },
      subscription_data: {
        metadata: {
          ...(user ? { userId: user.id } : {}),
          planId,
        },
      },
      integration_identifier: `folio_cv_${Math.random().toString(36).slice(2, 10)}`,
    } as Parameters<typeof stripe.checkout.sessions.create>[0]);

    return json({ url: session.url });
  } catch (error) {
    return json({ error: getErrorMessage(error) }, 500);
  }
}
