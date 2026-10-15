import { describe, expect, it } from 'vitest';
import { hasSubscriptionAccess } from './subscription-access';

const now = Date.parse('2026-10-15T12:00:00Z');
const future = '2026-10-22T12:00:00Z';

describe('subscription access deadlines', () => {
  it.each(['active', 'trialing'])('allows %s only before expiry', (status) => {
    expect(hasSubscriptionAccess(status, future, now)).toBe(true);
    expect(hasSubscriptionAccess(status, future, Date.parse(future))).toBe(false);
    expect(hasSubscriptionAccess(status, future, Date.parse(future) + 1)).toBe(false);
  });

  it.each(['canceled', 'past_due', 'unpaid', 'paused', 'incomplete', 'incomplete_expired', null])(
    'denies %s even with a future period end', (status) => {
      expect(hasSubscriptionAccess(status, future, now)).toBe(false);
    },
  );

  it.each([null, '', 'invalid date'])('denies active subscriptions with deadline %s', (end) => {
    expect(hasSubscriptionAccess('active', end, now)).toBe(false);
  });

  it('accepts PostgREST timestamps and honors their time zone', () => {
    expect(hasSubscriptionAccess('active', '2026-10-15 14:00:00+02', now - 1)).toBe(true);
    expect(hasSubscriptionAccess('active', '2026-10-15 14:00:00+02', now)).toBe(false);
  });
});
