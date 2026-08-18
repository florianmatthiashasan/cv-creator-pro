import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackPageView();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default PageViewTracker;
