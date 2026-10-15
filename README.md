# CV Builder

A free web-based CV builder that enables users to create professional resumes quickly and easily — without any payment or subscription.

🌐 Live: https://www.folio-cv.com

## Pro billing

The CV simulator and PDF export are free. Pro requires an `active` or `trialing`
Stripe subscription with a valid future access deadline. Cancellation through the
app sets `cancel_at_period_end`: access continues until that deadline, then stops
even if a webhook is delayed. Immediate Stripe cancellations and `past_due`,
`unpaid`, `paused`, or incomplete subscriptions do not grant Pro access.

Apply `supabase-stripe-subscriptions-migration.sql` and configure the server with
the Supabase service role, Stripe API key, recurring weekly/monthly/yearly price
IDs, and `STRIPE_WEBHOOK_SECRET`. Keep server keys out of browser variables.
The production Stripe event destination must point to `/api/stripe-webhook` and
include:

- `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `customer.subscription.paused`,
  `customer.subscription.resumed`
- `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`,
  `invoice.payment_action_required`

The status endpoint reconciles the saved subscription against Stripe; the app
refreshes this status every minute while visible and on focus. A local deadline
timer removes Pro access in an open tab even when the status request fails.
Server-side AI requests independently enforce the saved status and deadline.
Guest purchases are linked by persisted Stripe subscription/customer IDs so
renewals and cancellations work without user metadata.

Run `npm test` for access-boundary, timer, and signed-webhook lifecycle tests.
These tests use simulated Stripe/Supabase boundaries and make no live charges.
Verify event delivery and the lifecycle in a Stripe test environment before
deploying billing changes. See [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks).
