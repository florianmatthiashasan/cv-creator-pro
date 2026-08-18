type AnalyticsValue = string | number | boolean | undefined;

const CV_STARTED_SESSION_KEY = 'folio_cv_started_tracked';
let hasTrackedCvStartedFallback = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: 'event' | 'config',
      eventName: string,
      params?: Record<string, AnalyticsValue>,
    ) => void;
  }
}

const isAnalyticsReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

export const trackEvent = (eventName: string, params: Record<string, AnalyticsValue> = {}) => {
  if (!isAnalyticsReady()) return;

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

  window.gtag?.('event', eventName, cleanParams);
};

export const trackPageView = () => {
  if (!isAnalyticsReady()) return;

  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    page_title: document.title,
  });
};

export const trackCvStartedOncePerSession = () => {
  if (typeof window === 'undefined') return;

  try {
    if (window.sessionStorage.getItem(CV_STARTED_SESSION_KEY) === 'true') return;
    window.sessionStorage.setItem(CV_STARTED_SESSION_KEY, 'true');
  } catch {
    if (hasTrackedCvStartedFallback) return;
    hasTrackedCvStartedFallback = true;
  }

  trackEvent('cv_started');
};
