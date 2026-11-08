# Security, Performance and UX Audit — ECA platform

Date: 2026-11-09 · Build audited: eca-v76 (+ fixes in this change) · Scope: `index.html`, `js/*.js`, `firestore.rules`, `vercel.json`, `firebase.json`, `sw.js`, `scripts/`.

How it was checked:
- Reading the code paths listed below.
- `npm run audit` (static check).
- `npm run test:rules` (45 cases) and `npm run test:rules:emulator` (real rules, 394 cases).
- `npm run test:e2e`: real site code on the Auth + Firestore emulators in Chrome, including new checks at 320px width, offline and audio.

Notes on how the request maps to this codebase:
- **Stars, not coins.** The economy uses stars; there are no coins.
- **No `puzzles` collection.** Puzzles ship as static files (`puzzles.js`, `puzzles-themes.js`), cached by the service worker.
- **Rules file.** Duel rules live under `duels/` and `friendDuels/`.

## Summary

| Severity | Found | Fixed | Accepted / needs a server |
|---|---|---|---|
| Critical | 0 | — | — |
| High | 3 | 2 | 1 (H2) |
| Medium | 9 | 9 | 0 |
| Low | 4 | 2 | 2 |

## Critical

None found. The two classic critical issues were checked and are already closed:

- **Double-spending / double claims.**
  - Every star change goes through one `runTransaction` in `fbEconomy` (`js/firebase.js:672`). The transaction writes the profile and a receipt at `users/{uid}/economy/{id}` together.
  - Rewards have fixed receipt ids (for example `quest-<day>-<key>`, `spin-<day>`, `dojo-<puzzle>`, `boss-<id>`). A second claim finds the receipt and is refused, both in the transaction and in the rules (`firestore.rules:560`).
  - The rules check the balance arithmetic and refuse a negative balance (`firestore.rules:344`). Concurrent purchases retry on contention and read the new balance, so they cannot overspend.
  - Rapid multi-clicking was tested in E2E ("hint balance cannot be overspent", "quest twice a day", "chest twice").
- **Role spoofing.**
  - A student profile can only be created with `role == 'student'` (`firestore.rules:144`).
  - A `staff/{uid}` document needs a single-use invite claimed in the same write (`claimsInvite`, `firestore.rules:506`), and its role must equal the invite's role.
  - `staff` documents can't be updated (`allow update, delete: if false`).

## High

### H1 — Hall of Fame accepted a client-reported solve time (fixed)
- **Where:** `js/firebase.js:392` (`fbWeeklySolved`) and `firestore.rules`, `coachChallenges/{wid}/hallOfFame`.
- **Root cause:** the rules only checked `1000 <= ms <= 3600000`, so a student could post `ms: 1000` and take first place with a fake time.
- **Fix:** the rules now require `ms >= server time now − server time the attempt started − 30 s` (`firestore.rules:905`).
  - The attempt document is stamped with `request.time` when the board opens (`js/weekly.js:32-35`).
  - The 30 s allows for network delay only.
  - New emulator test: "weekly: Hall of Fame with a faked fast time" → denied.

### H2 — Puzzle and weekly-challenge solutions are readable in the browser (accepted risk, needs a server)
- **Where:** `coachChallenges/{week}.moves` is read by `fbWeeklyWatch` (`js/firebase.js:355`). Puzzle banks are static JS files.
- **Root cause:** the app has no backend code (Firebase Auth + Firestore only), so the client must know the answer to check a move.
  - Hashing the moves would not help: a position has about 30–40 legal moves, which can be hashed and compared in a moment.
- **What is enforced on the server today:**
  - The 2-attempt limit can't be bypassed by refreshing: the counter lives in `attempts/{uid}`, `n <= 2`, +1 per write (`firestore.rules:892`).
  - The attempt is stamped when it starts, and the solve must come within 1 h.
  - Since H1, the posted time can't be faster than the real time.
- **To fully close it:** move answer checking into a Cloud Function (or another server) that holds the moves and writes the result. That is a product and hosting decision, not a code fix.

### H3 — Rewards and boss hits were lost when the connection dropped (fixed)
- **Where:**
  - `fbEconomy` callers across the app.
  - The boss hit at `js/boss.js:154`.
- **Root cause:** Firestore transactions need the server. Offline they throw `unavailable`, and the client showed "try again", so the earned reward was lost.
- **Fix:**
  - **Rewards** (`op: "earn"`) that fail because the device is offline are queued and resent when the `online` event fires (`js/firebase.js:853`).
    - Each reward has a fixed receipt id, so a resend can never count twice.
    - The queue is tied to the signed-in uid, so it's dropped if someone else signs in.
  - **The boss hit** waits for the connection and retries up to 3 times instead of dropping the hit.
  - Purchases are not queued: a purchase is a decision made in the moment.
  - E2E covers it: the reward is queued offline, saved once the connection is back, and saved only once.

## Medium

| # | Issue | Where | Root cause | Fix |
|---|---|---|---|---|
| M1 | A new `AudioContext` for every star sound, closed 0.5 s later | `js/core.js:528` (was `new AudioContextClass()`) | Mobile Safari limits live contexts; sounds stop after a few rewards | One shared context `ecaAudio()` (`js/gamify.js:11`), never closed |
| M2 | Sound and voice stay silent on iOS and Android until a play happens to come inside a tap | `js/gamify.js` | Mobile browsers start the context `suspended` and resume it only from a user gesture | Capture-phase `pointerdown` / `touchstart` / `keydown` listener resumes the context and plays a silent buffer. It stays on, so sound also recovers after iOS interrupts audio (a call, the app in the background) |
| M3 | Background canvas redrew at 60 fps forever, including with reduced motion | `js/core.js:2200` | The `rAF` loop had no frame budget; reduced motion only set speed to 0, and the full redraw still ran every frame | 30 fps cap; with reduced motion it redraws once per second (still picks up theme changes) |
| M4 | Elite frames and the Fire frame animated `box-shadow` without end | `index.html:448` | `box-shadow` repaints every frame | The glow is now an `::after` layer whose `opacity` animates (compositor-only); same colors. Reduced motion turns it off |
| M5 | Buttons under 44 px across the student views: arena tabs 36–38 px; board color swatches 24 px; piece set, play color and time control buttons 30–34 px; weekly "Solve" 43 px wide. A static scan found about 146 buttons with no minimum size | `js/arena.js:595,619,623`, `js/arena2.js:213`, `js/weekly.js:156`, others | Padding only, no minimum size | One rule: every button in `#mainView`, the nav and the HUD is at least 44×44 px (`index.html:52`), plus `tap` on the arena tabs. E2E measures every button on 14 views at 320 px |
| M6 | Test, seed and docs files were publicly downloadable from Vercel | `/scripts/*`, `CLAUDE.md`, `firestore.rules` (all returned HTTP 200) | Vercel publishes the whole repo; only `firebase.json` had an ignore list | `.vercelignore`. No secrets were in them (the seeder only talks to local emulators) |
| M7 | Any signed-in student could run the system check from DevTools | `js/core.js:32`, `js/diagnostics.js:114` | The global was open to everyone | Staff only on the real site (still allowed on 127.0.0.1 for E2E). It was already read-only and the rules apply anyway |
| M8 | A double tap in the shop could buy a consumable twice (hint, streak freeze) | `js/core.js` `buyShopItem` | No in-flight lock. Not a cheat (stars are really deducted), but an unintended purchase | Per-item lock while the purchase is in flight |
| M9 | Leaderboard and parent report showed text, then rows popped in | `js/gamify.js:173`, `js/parentreport.js:205` | No placeholder with the final shape | Shimmer skeleton rows and blocks (the shimmer moves with `transform`) |

## Low

| # | Issue | Status |
|---|---|---|
| L1 | Emote toast used `white-space: nowrap` with no max width, so a long nickname could overflow at 320 px | Fixed: `max-width: calc(100vw - 24px)` with ellipsis (`index.html:462`) |
| L2 | Offline state only showed a toast that disappears | Fixed: a fixed "No internet" status banner until the connection is back (`js/core.js:2159`) |
| L3 | `puzzles-themes.js` (≈560 KB) is served with `max-age=0, must-revalidate` | Kept. The service worker precaches it per version, and revalidation is a cheap 304. Marking it `immutable` would be unsafe because it's not always loaded with `?v=` |
| L4 | `popstate` takes `history.state.tab` without a whitelist | Kept. Only this origin can write its history state, and an unknown tab renders the default view |

## Checked and fine (no change)

- **XSS.**
  - Dynamic values in templates go through `esc()`. A scan of `${…}` with name, nickname, group, title, note or similar fields found no unescaped user value.
  - User text is limited at write time by the rules (`safeText`, `firestore.rules:21`, which blocks `< > " ' \``).
  - It is stripped again at read time (`cleanDeep`, `js/firebase.js:24`).
  - `?duel=` is checked with `^[A-Za-z0-9]{10,40}$` and removed from the URL (`js/friendduel.js:13`).
  - The tab hash is whitelisted.
- **Duels.** `duels/` and `friendDuels/` writes are limited to the two players and to fixed fields. Friend-duel puzzle ids must be 5 distinct, well-formed ids.
- **Lesson mission counter.** It can only rise by 1 together with a recorded solved attempt (`firestore.rules:179`).
- **Rate limits.**
  - Boss hits: one per 2 s.
  - Dojo: 5 per day.
  - Emotes and drops are limited in the rules.
- **Firestore cache.** `persistentLocalCache` with a multi-tab manager is already on (`js/firebase.js:20`).
  - The puzzle banks and shop catalog are static files cached by the service worker, so Firestore reads aren't used for them.
  - Listeners are named and close with their view and on logout (`ecaListeners()`).
- **Scripts.** All app scripts load at the end of `<body>` in dependency order. `firebase.js` is the only module, and lazy modules load on demand.
- **Fonts.** `preconnect` to both Google Fonts hosts with `display=swap`.
- **Caching.** `/js/*`, `/img/*` and `tailwind.css` are cached `immutable` and loaded with `?v=eca-vN`.
- **State sync.** The HUD, shop balance and profile all read from the same profile listener. E2E checks that the HUD stars match the server after duels, boss homework and live drops.
- **Chessboard.** It uses `touch-action: none` while it's interactive (`index.html:178`), so dragging doesn't scroll the page.

## Measured after the fixes

- **Tests:**
  - `npm run test:e2e`: **201 passed, 0 failed**. New checks:
    - No sideways scroll on 14 views at 320 px.
    - Every touch target ≥ 44 px.
    - One shared audio context.
    - Offline banner shows and hides.
    - A reward earned offline is queued, saved when the connection is back, and saved only once.
    - A double tap in the shop buys once.
    - Students can't run the system check on the real domain.
  - `npm run test:rules:emulator`: **394 passed, 0 failed** (new: faked Hall of Fame time is denied), also with +40 extra terms.
  - `npm run test:rules`: 45/45.
  - `npm run audit`: no problems.
- **Background animation:** frame work halved (60 → 30 fps); with reduced motion it went from 60 redraws/s to 1.
- **Glowing frames:** they no longer repaint every frame; only opacity is composited.
