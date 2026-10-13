# SEO – how it works

`npm run build` builds the site and then (postbuild) pre-renders SEO pages into `dist/`:
home, /hotels, /about, /faq, /contact and one page per hotel, plus sitemap.xml and robots.txt.

Hotels are read live from your API (`VITE_API_BASE_URL`, or `PRERENDER_API_URL` to override).
The API must be running when you build. If it is offline, the fixed pages are still written.

After adding or editing hotels in QloApps, refresh the SEO pages WITHOUT rebuilding:

    npm run seo

(Safe to run any time, or on a schedule.)

Set your real domain in `.env`:   VITE_SITE_URL=https://yourdomain.pk

Upload the contents of `dist/` (including the hidden `.htaccess`) to your Apache web root.
After going live: add the site in Google Search Console and submit https://yourdomain.pk/sitemap.xml
