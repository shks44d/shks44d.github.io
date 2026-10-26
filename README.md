# Muhammad Saad Ahmed

A responsive cybersecurity portfolio with an original interactive 3D guardian, midnight navy and glacier blue colors, and self-hosted typography. No build step, analytics, or third-party requests are required. Three.js 0.180.0 is vendored locally with its MIT license.

## Preview

Requires Node.js 20+.

```text
npm run dev
```

Open **http://localhost:4317**. `npm run check` verifies local assets, privacy requirements, the PDF, page sections, and video byte-range support while the server runs.

## Files

- `public/index.html`: homepage, résumé content, contact details, accessible navigation.
- `public/styles.css`: responsive design system and reduced-motion support.
- `public/app.js`: project details, showcase dialogs, mobile navigation.
- `public/guardian.js`: original procedural 3D model, cursor tracking, motion controls and offscreen suspension.
- `public/assets/`: self-hosted Sora and Source Sans 3 fonts, original résumé PDF, optimized screenshots and supplied showcase videos.
- `server.mjs`: loopback-only development server with video range support.

The website is configured for GitHub Pages at https://shks44d.github.io/. Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which publishes only the contents of `public/`. The local server and development checks are not included in the deployed website.

The same website is also deployed at https://s44d.vercel.app/ in the Vercel project `saad-6430/s44d`. `vercel.json` serves `public/` as a static site without a build or installation step. To update this deployment, run `vercel deploy --prod --scope saad-6430` from the linked local checkout. Git-based Vercel updates require connecting the GitHub account in Vercel; that connection is not currently enabled. GitHub Pages remains independent and continues to update from `main`.

## Content and assets

Professional content follows the supplied résumé. CEH is explicitly in progress; Junior Penetration Tester is a completed TryHackMe learning path. Public contact includes email, LinkedIn and GitHub; Instagram and X appear only in the footer. The page contains no phone number; the original downloadable résumé includes it, with permission.

Real screenshots and videos were copied from the supplied Contract-Radar and Sentinel showcase folders. SafeScan’s real home screenshot was captured from its existing local application, without running a scan. Its supplied video is an illustrative walkthrough and is labeled accordingly. Socluma uses a labeled explanatory architecture diagram because no showcase folder was available. Original source assets and other project repositories were left unchanged.

Videos are loaded on demand inside native accessible dialogs and never autoplay. Screenshots open at full size. Local fonts and WebP images keep routine page loads small. Email buttons open the visitor’s mail application; they do not submit messages to a server.

## Interactive guardian

The guardian uses separate neck and head geometry. Head movement follows a mouse or pen within the hero and returns to center on exit. Animation pauses when offscreen or in a background tab. Reduced-motion preferences disable animation by default; visitors can also pause it manually. On touch devices, passive touch tracking turns the head without blocking native scrolling or pinch zoom. Only the main 3D guardian is displayed; the light field stays empty while it loads or if WebGL is unavailable. Sora and Source Sans 3 use the SIL Open Font License; license files accompany the fonts.
