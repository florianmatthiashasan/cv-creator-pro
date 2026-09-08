import { getOrCreateBillingUserIdForEmail, upsertSubscription } from './_billing.js';
import { createServiceSupabaseClient, json } from './_supabase-server.js';
import { getOrigin, getStripe } from './_stripe.js';

const getString = (value: unknown) => (typeof value === 'string' ? value : null);

async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing checkout session.' }, 400);

  // Stripe has already charged the customer by the time it redirects here, so no failure
  // below may surface as an error page. Send the buyer into the app with a sign-in prompt
  // instead and let the stripe-webhook retries (up to 3 days) finish provisioning.
  const sendToSignIn = () =>
    new Response(null, {
      status: 303,
      headers: { location: `${getOrigin(request)}/?checkout=success&signin=1` },
    });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email?.trim().toLowerCase();
    const subscriptionId = getString(session.subscription);

    if (!email || !subscriptionId) {
      console.error('stripe-checkout-success: session is missing customer or subscription', sessionId);
      return sendToSignIn();
    }

    const userId = await getOrCreateBillingUserIdForEmail(email);
    if (!userId) {
      console.error('stripe-checkout-success: could not resolve a user id for', email);
      return sendToSignIn();
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await upsertSubscription(subscription, getString(session.client_reference_id) || getString(session.metadata?.userId) || userId);

    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      console.error('stripe-checkout-success: SUPABASE_SERVICE_ROLE_KEY is not configured');
      return sendToSignIn();
    }

    const redirectTo = `${getOrigin(request)}/dashboard?checkout=success`;
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo,
      },
    });

    if (error || !data.properties?.hashed_token) {
      console.error('stripe-checkout-success: generateLink failed', error?.message);
      return sendToSignIn();
    }

    // Deliberately NOT redirecting to properties.action_link: that link comes back as an
    // implicit-grant callback (#access_token=…), and the browser client is created by
    // @supabase/ssr with flowType 'pkce', which throws AuthPKCEGrantCodeExchangeError
    // ('Not a valid PKCE flow url.') instead of storing the session. Handing the app the
    // hashed token lets it redeem the link via verifyOtp(), which is flow-type agnostic.
    const params = new URLSearchParams({
      checkout: 'success',
      token_hash: data.properties.hashed_token,
      type: 'magiclink',
    });

    return new Response(null, {
      status: 303,
      headers: {
        location: `${getOrigin(request)}/dashboard?${params.toString()}`,
      },
    });
  } catch (error) {
    console.error('stripe-checkout-success: unhandled failure', error);
    return sendToSignIn();
  }
}

export const fetch = handler;
