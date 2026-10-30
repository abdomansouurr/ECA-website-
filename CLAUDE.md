# ECA — Egypt Chess Academy Platform

Static client-side RTL Arabic/English web app. Backend: Firebase Auth + Firestore ONLY. Deployed on Vercel/Firebase Hosting.
Roles: `admin`, `coach` (`staff/`), `student` (`users/`), parents (`parentLinks`).

## Commands
- `npm run build:css` — rebuild `tailwind.css` (compiled output only includes classes scanned from `index.html` + `js/**/*.js`).
- `npm run bump` — bump `eca-vN` in `index.html` and `sw.js`.
- `npm run release` — runs `build:css` + `bump`.
- `npm run test:rules` — simulate `firestore.rules` (MUST run after any rules edit).
- `npm run vendor` — download self-hosted `vendor/chess.js` & `vendor/stockfish.js`.
- Deploy Firestore rules manually via Console or `firebase deploy --only firestore:rules`.

## Architecture
- `index.html`: Shell + theme CSS (dark default, `html.light`, `html.eca` blue theme in `eca-v29` block).
- `js/*.js`: Classic scripts sharing ONE global scope, loaded in `index.html` order. `js/firebase.js` is the ONLY ES module (exposes `window.fb*`). NEVER wrap other files in modules.
- UI & State: String-templated HTML rendered via `render()` (`innerHTML`). State lives in `db`, `tab`, and module vars.
- Function Patching: Later files override earlier ones (`quality.js` overrides `deleteStudent`, `extras.js` wraps `renderStudentHome`). Always grep for re-definitions before editing a function.
- Chess Engine: `boardHTML()` (`arena.js`) renders boards; `arena2.js` = drag/premove; `annotate.js` = right-click arrows (needs `data-h`/`data-fen`); `puzzles.js` = lazy puzzle bank; Stockfish runs in blob Worker via `stockfishBoot()`.
- Placement Test: `placement.js` & `placement-data.js`. Approved levels publish to `placementLevels/{sha256(studentPhone|parentPhone)}`; students link via `plk` at signup (`plOk()` in rules).
- i18n: Arabic is source text (`trText()`, `ptL(ar, en)`). New Arabic strings work untranslated.
- Animations: `ecaCurtainToggle(key, flip)` + `data-curtain="key"`, `ecaCurtainShow/Hide` for menus, `.page-enter` for page transitions (respect `prefers-reduced-motion`).

## Conventions & UI Rules
- NEVER alter existing theme colors (dark/light/`html.eca`) unless explicitly requested.
- Touch targets >= 44px, text >= 12px, icon-only buttons require `title`/`aria-label`.
- Adding a new JS file requires adding it to BOTH `index.html` AND the precache list in `sw.js`.

## Security Rules (Firebase & Client-Side Strict)
- **XSS Prevention:** EVERY interpolated dynamic value in HTML templates MUST pass through `esc()`. Inline `onclick` handlers may ONLY receive static keys or IDs, never raw user strings.
- **Zero-Trust Client:** Never rely on client-side checks for security. `firestore.rules` is the single source of truth for authorization (deny by default, verify ownership/roles explicitly).
- **Role Boundaries:** Coaches can read/update students; deleting students or attempts is strictly `admin`-only. Students self-register at Step 1 (or placement-approved level).
- **Secrets & Dependencies:** Never hardcode sensitive keys or log auth tokens. Do not install unverified npm packages without explicit user confirmation.

## Strict Agent Constraints (Token & Code Protection)
- NEVER modify files outside the explicit scope of the user's prompt.
- NEVER add inline CSS fallbacks in `index.html` for missing Tailwind classes; simply remind the user to run `npm run build:css`.
- Do NOT bump `sw.js` cache version unless explicitly asked to prepare for release.
- Keep responses extremely concise. Output targeted code edits only—no long explanations or unsolicited security summaries unless a rule is violated.