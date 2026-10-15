export const parseSubscriptionTimestamp = (value: string) =>
  Date.parse(value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'));

// A scheduled cancellation remains active until its deadline. A terminal Stripe status
// (including immediate cancellation) never grants access, even with a future period end.
export const hasSubscriptionAccess = (
  status: string | null,
  currentPeriodEnd: string | null,
  now = Date.now(),
) => {
  if ((status !== 'active' && status !== 'trialing') || !currentPeriodEnd) return false;
  const end = parseSubscriptionTimestamp(currentPeriodEnd);
  return Number.isFinite(end) && end > now;
};
