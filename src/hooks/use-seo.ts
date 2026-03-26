import { useEffect } from 'react';

interface UseSeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
  jsonLd?: Array<Record<string, unknown>>;
}

const upsertMeta = (selector: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector(`meta[${selector}="${key}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(selector, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

export const useSeo = ({
  title,
  description,
  path = '/',
  image = '/folio-cv-logo.png',
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  jsonLd = [],
}: UseSeoOptions) => {
  useEffect(() => {
    const origin = window.location.origin;
    const absoluteUrl = new URL(path, origin).toString();
    const absoluteImageUrl = new URL(image, origin).toString();

    document.documentElement.lang = 'en';
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'author', 'yourdeveloperhsn');
    upsertMeta('name', 'theme-color', '#f5efe7');
    upsertMeta('name', 'application-name', 'Folio CV');

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Folio CV');
    upsertMeta('property', 'og:locale', 'de_DE');
    upsertMeta('property', 'og:url', absoluteUrl);
    upsertMeta('property', 'og:image', absoluteImageUrl);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteImageUrl);

    upsertLink('canonical', absoluteUrl);

    document
      .querySelectorAll('script[data-seo-jsonld="true"]')
      .forEach((script) => script.parentNode?.removeChild(script));

    jsonLd.forEach((entry, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoJsonld = 'true';
      script.dataset.seoJsonldId = String(index);
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [description, image, jsonLd, path, robots, title]);
};
