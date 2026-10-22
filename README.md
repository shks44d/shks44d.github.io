# Muhammad Saad Ahmed — Meridian portfolio

A responsive static portfolio based on the selected midnight navy and glacier blue Meridian design. No runtime packages, build step, analytics, or third-party font requests are required.

## Preview

Requires Node.js 20+.

```text
npm run dev
```

Open **http://localhost:4317**. `npm run check` verifies local assets, privacy requirements, the PDF, page sections, and video byte-range support while the server runs.

## Files

- `public/index.html`: homepage, résumé content, contact details, accessible navigation.
- `public/styles.css`: responsive Meridian design system and reduced-motion support.
- `public/app.js`: project details, showcase dialogs, mobile navigation, clipboard action.
- `public/assets/`: self-hosted Inter and Manrope fonts, original résumé PDF, optimized screenshots and supplied showcase videos.
- `server.mjs`: loopback-only development server with video range support.

The website is configured for GitHub Pages at https://shks44d.github.io/. Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which publishes only the contents of `public/`. The local server, preparation scripts, and preview captures are not included in the deployed website.

## Content and assets

Professional content follows the supplied résumé. CEH is explicitly in progress; Junior Penetration Tester is a completed TryHackMe learning path. Public contact includes email, LinkedIn and GitHub; Instagram appears only in the footer. The page contains no phone number; the original downloadable résumé includes it, with permission.

Real screenshots and videos were copied from the supplied Contract-Radar and Sentinel showcase folders. SafeScan’s real home screenshot was captured from its existing local application, without running a scan. Its supplied video is an illustrative walkthrough and is labeled accordingly. Socluma uses a labeled explanatory architecture diagram because no showcase folder was available. Original source assets and other project repositories were left unchanged.

Videos are loaded on demand inside native accessible dialogs and never autoplay. Screenshots open at full size. Local fonts and WebP images keep routine page loads small. Email buttons open the visitor’s mail application; they do not submit messages to a server.
