type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'event', eventName: string, params?: Record<string, AnalyticsValue>) => void;
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
