# Project Memory

Last updated: 2026-03-12

## What this project is
- Static multi-page portfolio/agency site (no app framework, no package manager config in repo).
- Main pages: `index.html`, `capabilities/index.html`, `work/all/index.html`, `playground/index.html`, and individual case-study pages under `work/*/index.html`.
- Heavy media-driven experience (many `.webm`/`.mp4`/`.webp` assets under `media/`).

## Runtime stack (browser-side)
- Smooth scrolling: Lenis (CDN).
- Animation + interactions: GSAP + Flip + ScrollTrigger + Draggable + InertiaPlugin + SplitText (CDN).
- Page transitions: Barba.js (`@barba/core` via CDN).
- Tracking scripts embedded in page heads: Hotjar + GA (`gtag`).

## Core code locations
- Shared JavaScript: `scripts/script.js`
- Styles source: `styles/style.scss`
- SCSS partials: `styles/_variables.scss`, `styles/_components.scss`, `styles/_project-pages.scss`, `styles/_animations.scss`
- Compiled CSS artifact: `styles/style.css` (+ `styles/style.css.map`)

## Barba namespaces and JS entry points
- `home` -> homepage interactions (`projectsSection`, `becauseWeAnimation`, `testimonialsSection`, `pageReveal`, etc.)
- `project` -> case-study interactions (`caseStudyAnimations`, compare/drag sections, project transition enter)
- `allWork` -> work listing interactions (`workPage`)
- `capabilities` -> overlay behavior (`capabilitiesOverlay`)
- `playground` -> fullscreen media behavior (`playgroundPage`)

## Editing workflow notes
- This is a shared-class, shared-script setup: most pages depend on common selectors and helper functions in `scripts/script.js`.
- Keep relative paths correct per depth:
  - root page uses `media/...`, `styles/...`, `scripts/...` style paths
  - nested pages use `../` or `../../` prefixes
- Language structure:
  - Romanian is primary under root paths (e.g. `/`, `/work/...`).
  - English mirrors all main pages under `/en/...` with the same folder depth.
  - Because `/en` adds one extra path segment, EN pages must use one extra `../` for shared assets (`media/`, `styles/`, `scripts/`).
- If adding a new page type, set `data-barba-namespace` and register matching behavior in `barba.init({ views: [...] })`.
- Prefer editing SCSS sources (`style.scss` + partials) and keep compiled `style.css` in sync.

## Local dev / preview
- No local build/dev scripts are present in repo.
- Serve as a static site from repo root (example): `python3 -m http.server 8080` then open `http://localhost:8080`.

## Current repo state notes
- Git working tree already has existing `.DS_Store` modifications:
  - `.DS_Store`
  - `media/.DS_Store`
  - `media/work/.DS_Store`
- `playground/index.html` currently contains duplicated `.cookies-wrapper` markup.

## Update log
- 2026-03-12: Initial project scan and baseline memory created.
- 2026-03-12: Reframed authored site copy from first-person plural to first-person singular (`we` -> `I`) across main pages/case studies. Kept client testimonial quotes in their original voice.
- 2026-03-12: Added bilingual structure with EN mirror pages under `/en/` (home, capabilities, playground, work listing, and project pages). Added `RO | EN` header language switcher and active-language styling across all mirrored pages.
- 2026-03-12: Added per-page canonical + `hreflang` tags (`ro`, `en`, `x-default`) for mirrored pages.
- 2026-03-12: Localized Romanian pages with a first full pass: navigation/footer/cookie/system labels, project metadata labels, key homepage/capabilities/work/playground copy, and case-study navigation labels (`Proiectul următor`, etc.). English pages under `/en` remain source-language.
- 2026-03-12: Updated mobile menu toggle logic in `scripts/script.js` to be language-aware (`MENIU`/`ÎNCHIDE` on RO pages, `MENU`/`CLOSE` on EN pages).
- 2026-03-12: Completed Romanian translation pass for case studies (`work/benefit`, `work/elifinty`, `work/ibm-comprehend`, `work/sanopass`, `work/suvoda`) and synchronized shared project templates (`work/project.html`, `work/_default/project.html`) so new project pages inherit Romanian-first copy.
- 2026-03-12: Reordered header controls site-wide so language switcher appears after the contact CTA button (applied in both `/` and `/en` page sets).
- 2026-03-16: Updated homepage hero copy in both languages. EN uses the new remote-product-designer statement; RO mirrors it with localized phrasing while keeping the same pre-heading + heading structure.
- 2026-03-23: Rebuilt the homepage (`/` and `/en/`) toward the new Figma direction: transparent hero header with language switch inside nav, billboard hero, editorial intro section, static featured project cards, and a redesigned footer. Preserved project-page viewport transition by keeping hidden per-card source videos referenced by `video-id`.
- 2026-03-23: Removed the temporary hero overlay treatment and switched the homepage redesign assets from remote Figma URLs to local files under `media/home/*.webp`.
- 2026-03-23: Exported homepage Figma assets locally (`hero`, featured project previews, avatar, footer artworks) and installed the `webp` encoder via Homebrew to convert them into real `.webp` files.
- 2026-03-23: Propagated the wide homepage shell (`width-limiter-home`) to top-level page headers and main wrappers on `work/all`, `playground`, and `capabilities` (RO + EN) so header/content alignment uses the same wide structure instead of the older narrow limiter.
- 2026-03-23: Removed the old homepage splash/page-reveal screen from both RO and EN homepages and decoupled the hero heading intro animation from it (`homeHeroIntro` in `scripts/script.js`).
- 2026-03-23: Renamed site metadata from `STORM Studio` to `FURTUNA` across page titles and Open Graph/Twitter title tags. Also switched favicons and Apple touch icons to the local footer portrait asset: `media/home/adrian.webp`.
- 2026-03-23: Rewrote OG/Twitter descriptions page by page for RO and EN variants so homepage, capabilities, playground, work listing, and each case study now have portfolio-specific share copy instead of the old generic studio messaging.
- 2026-03-23: Fixed project-page header shell drift by moving case-study/project headers onto `width-limiter-home` as well. Also removed the delayed `sleep + scrollTo(100) + scrollTo(0)` sequence from `indexToProjectTransitionEnter()` so homepage-to-project viewport transitions run immediately instead of waiting, scrolling, and then animating.
- 2026-03-23: Replaced the legacy CTA/blob footer on non-home pages (`capabilities`, `playground`, `work/all`, case studies, and shared project templates in RO + EN) with the new homepage footer component and localized copy. This removes `_contact-blob` markup from runtime pages that participate in Barba transitions.
- 2026-03-23: Hardened homepage-to-project transitions in `scripts/script.js` by hiding the incoming project container in Barba `beforeEnter`, awaiting `indexToProjectTransitionEnter()` inside `runViewInitializers('project')`, and revealing the next container only once the Flip target is prepared. Also force-hide `next-project-wrapper` until the hero morph finishes.
- 2026-03-23: Refined the project transition again after regressions: scope `indexToProjectTransitionEnter()` to the incoming Barba container (`container.querySelector('.project-hero')` etc.) instead of global `document` queries, and hide only project header/title/meta UI in `beforeEnter` rather than the whole next container. This is intended to prevent the morph from animating only on the homepage and to keep the incoming video geometry stable.
- 2026-03-23: Moved the homepage-to-project hero morph into Barba's `enter` hook instead of running it from the `project` view `afterEnter` initializer. Also raised `.video-transition-wrapper` to `z-index: 1200` and made it `pointer-events: none` so the morph layer stays above headers/progress UI during the transition.
- 2026-03-23: Stripped the old live-node/Flip homepage-to-project viewport morph and rewrote it as a clone-based transition. `indexToProjectTransitionLeave()` now creates a fixed transition stage inside `.video-transition-wrapper` using cloned card media; `indexToProjectTransitionEnter()` animates that stage to the incoming project hero video bounds, then reveals the real in-page hero video and UI. This avoids moving live video DOM between Barba pages.
- 2026-03-23: Fixed a follow-up regression in the clone-based transition: the transition stage must not reuse the old `._video-wrapper` selector because `.video-transition-wrapper ._video-wrapper` carried the previous full-screen black background and altered video opacity. The stage now uses its own `.viewport-transition-stage` class with isolated image/video sizing.
- 2026-03-23: Removed the homepage-to-project viewport morph entirely. Project navigation now uses a normal Barba page swap plus a simpler `projectPageEnter()` intro animation on project pages: scroll reset, header slide-in, project title/meta reveal, and next-project card fade-in. `video-transition-wrapper` remains only as an inert/reset layer.
- 2026-03-23: Implemented new bilingual resume pages at `/resume/` and `/en/resume/`, based on Figma node `4192:8324`, but translated into the current static HTML/CSS/JS site shell instead of copying the Figma header literally. Added a `resume` Barba namespace and resume-specific layout styles in `styles/style.scss`.
- 2026-03-23: Turned the disabled `CV/RESUME` nav item into a real link across the newer shared header/mobile-menu pages (home, playground, work listing, case studies, and project templates). The older custom `capabilities` header was intentionally left untouched for now because it still uses a separate nav structure.
- 2026-03-23: Refactored the resume pages after the Figma structure was rebuilt. The resume DOM now follows the design hierarchy more directly: `resume-content` as a right-aligned vertical wrapper, `resume-hero` + `resume-hero-content`, a fixed-width `resume-history-row` for `Full time` and `Contract`, and a separate right-aligned `resume-section--writing`. The previous page-wide 12-column grid approximation was removed for this page.
- 2026-03-23: Updated the resume `Writing` section from Medium RSS rather than the stale placeholder copy: each writing row now links to the canonical article URL, uses original article titles, and shows a small local hover preview (`150px` / `9.375rem` wide) sourced from hero images saved under `media/resume/*.webp`. Also increased resume entry `column-gap` from `4.75rem` to `6rem`.
- 2026-04-07: Started a playground WebGL gallery experiment based on the Codrops GSAP + Three.js scroll-reveal article. Kept deploy static/no-build for Apache/Romarg: vendored Three locally under `vendor/three/three.module.min.js`, added `scripts/playground-webgl.js` as an ES module with inline shaders, and load it dynamically from `playgroundPage()` only when `.playground-webgl-grid` exists. The old masonry code remains in `scripts/script.js` as a fallback path for `.playground-grid`.

## 2026-04-07
- Added playground WebGL detail-page prototype: clickable WebGL media cards route to generic RO/EN detail pages and use Barba + GSAP Flip for clicked-media transition.
