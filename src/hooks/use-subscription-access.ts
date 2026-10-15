import { useEffect, useState } from 'react';
import { hasSubscriptionAccess, parseSubscriptionTimestamp } from '@/lib/subscription-access';

type AccessState = {
  isActive: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
};

export const useSubscriptionAccess = (subscription?: AccessState) => {
  const [now, setNow] = useState(Date.now);
  const end = subscription?.currentPeriodEnd;

  useEffect(() => {
    if (!end) return;
    const remaining = parseSubscriptionTimestamp(end) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;

    // Re-render at expiry even if a status request fails or the tab stays open for days.
    // Browsers clamp longer timeouts to 1 ms, so re-arm long (e.g. annual) periods in steps.
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(remaining, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [end, now]);

  return Boolean(subscription?.isActive && hasSubscriptionAccess(subscription.status, end ?? null, Date.now()));
};
