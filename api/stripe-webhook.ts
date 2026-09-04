import Stripe from 'stripe';
import { json } from './_supabase-server';
import { getOrCreateBillingUserIdForEmail, upsertSubscription } from './_billing';
import { getStripe } from './_stripe';

const getString = (value: unknown) => (typeof value === 'string' ? value : null);

const handleCheckoutCompleted = async (stripe: Stripe, session: Stripe.Checkout.Session) => {
  const subscriptionId = getString(session.subscription);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const checkoutEmail = session.customer_details?.email || null;
  const checkoutUserId = checkoutEmail ? await getOrCreateBillingUserIdForEmail(checkoutEmail) : null;
  await upsertSubscription(subscription, getString(session.client_reference_id) || getString(session.metadata?.userId) || checkoutUserId);
};

const handleInvoiceEvent = async (stripe: Stripe, invoice: Stripe.Invoice) => {
  const subscriptionId = getString((invoice as Stripe.Invoice & { subscription?: unknown }).subscription);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription);
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return json({ error: 'STRIPE_WEBHOOK_SECRET is not configured.' }, 500);

  const signature = request.headers.get('stripe-signature');
  if (!signature) return json({ error: 'Missing Stripe signature.' }, 400);

  const stripe = getStripe();
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid Stripe signature.' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(stripe, event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Webhook handling failed.' }, 500);
  }

  return json({ received: true });
}
