import { getOrCreateBillingUserIdForEmail, upsertSubscription } from './_billing.js';
import { createServiceSupabaseClient, json } from './_supabase-server.js';
import { getOrigin, getStripe } from './_stripe.js';

const getString = (value: unknown) => (typeof value === 'string' ? value : null);

async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing checkout session.' }, 400);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = session.customer_details?.email?.trim().toLowerCase();
  const subscriptionId = getString(session.subscription);

  if (!email || !subscriptionId) {
    return json({ error: 'Checkout session is missing customer or subscription details.' }, 400);
  }

  const userId = await getOrCreateBillingUserIdForEmail(email);
  if (!userId) return json({ error: 'User konnte nach Checkout nicht erstellt werden.' }, 500);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription, getString(session.client_reference_id) || getString(session.metadata?.userId) || userId);

  const supabase = createServiceSupabaseClient();
  if (!supabase) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, 500);

  const redirectTo = `${getOrigin(request)}/dashboard?checkout=success`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo,
    },
  });

  if (error || !data.properties?.action_link) {
    return json({ error: error?.message || 'Login link konnte nicht erstellt werden.' }, 500);
  }

  return new Response(null, {
    status: 303,
    headers: {
      location: data.properties.action_link,
    },
  });
}

export const fetch = handler;
