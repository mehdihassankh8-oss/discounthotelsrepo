import { useEffect } from 'react';
import { SITE_URL } from '../seo/routes';
import { DEFAULT_OG_IMAGE, type SeoConfig } from '../seo/seoData';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Keeps <title>, description, canonical, social tags, robots and JSON-LD in step with the visible page.
export function useSeo(cfg: SeoConfig) {
  const ld = JSON.stringify(cfg.jsonLd ?? []);
  useEffect(() => {
    const url = `${SITE_URL}${cfg.path}`;
    const image = cfg.image || DEFAULT_OG_IMAGE;

    document.title = cfg.title;
    setMeta('name', 'description', cfg.description);
    setMeta('name', 'robots', cfg.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', cfg.title);
    setMeta('property', 'og:description', cfg.description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:title', cfg.title);
    setMeta('name', 'twitter:description', cfg.description);
    setMeta('name', 'twitter:image', image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    document.head.querySelectorAll('script[data-seo-page]').forEach((n) => n.remove());
    (JSON.parse(ld) as Record<string, unknown>[]).forEach((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-page', '1');
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }, [cfg.title, cfg.description, cfg.path, cfg.noindex, cfg.image, ld]);
}
