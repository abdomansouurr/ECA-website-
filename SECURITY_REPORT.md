# Pre-launch Security Report — ECA platform

Date: 2026-11-12 · Build: eca-v88 → next release · Live site checked: https://eca-website-for-coach.vercel.app

## How this app is built (and why some checklist items look different)

There is no server of our own. The site is static files on Vercel; the backend is Firebase:
- **Login** is Firebase Authentication (Google's servers).
- **Data** is Cloud Firestore. Every read and write is checked by `firestore.rules` on Google's servers, so the rules are the real "server-side" security. Nothing the browser does can get around them.

So there is no `/api/login`, no SQL database, no session cookies, no checkout and no file upload endpoint. The items about those are mapped to their Firebase equivalents below, or marked "not applicable" with the reason.

## How it was checked

| Check | Result |
|---|---|
| `npm run test:e2e`: real site code in Chrome on the Auth + Firestore emulators | 279 passed, 0 failed (including 320px, touch targets and no denied writes) |
| `npm run test:rules` (rules simulator) | 45 passed, 0 failed |
| `npm run test:rules:emulator` (the real `firestore.rules` on the emulator) | 412 passed, 0 failed |
| `npm run audit` (handlers, ids, script tags) | No problems |
| `npm audit` | 27 advisories, all in dev/test tools (see item 21) |
| Git history scan, all branches, every commit, for private keys, tokens, `sk_`, `ghp_`, AWS keys, JWTs, passwords and `.env` files | Nothing found except the Firebase web config key (see item 24) |
| Live site: headers, HTTP→HTTPS, 17 sensitive paths | See items 4, 14 and 23 |
| Code review: every `innerHTML` template with user data, `onclick` handlers that pass record IDs, `eval`-like sinks, password handling, random number sources | One stored XSS found and fixed (S1) |

## Findings

| ID | Severity | Finding | Files | Status |
|---|---|---|---|---|
| S1 | Medium | Stored XSS through an announcement ID | `js/announce.js` | Fixed |
| S2 | Low | The site could be framed by itself (`X-Frame-Options: SAMEORIGIN`) | `vercel.json`, `firebase.json` | Fixed |
| S3 | Low | `Access-Control-Allow-Origin: *` on every file (Vercel's default) | `vercel.json` | Fixed |
| S4 | Low | `tailwind.config.js` was public; the deploy ignore lists did not cover `.env*`, `.sql`, `.bak`, `.zip`, logs and root scripts | `.vercelignore`, `firebase.json` | Fixed |
| S5 | Low | The Content Security Policy is report-only, and it did not allow the Google Maps frame on the contact page | `vercel.json`, `firebase.json` | Map fixed; enforcing it is manual |
| S6 | Low | Dev and test tools have known vulnerabilities | `package.json` | Manual (needs your OK) |
| S7 | Info | Password length (8+) is checked only in the browser; Firebase's own minimum is 6 | Firebase console | Manual |

### S1 — Stored XSS through an announcement ID (fixed)

**Where:** `js/announce.js`. Announcements are stored as a list in `meta/announcements`. The rules only check that the writer is staff, not what is inside the list.

**Problem:** each announcement's `id` was put inside an inline handler, `onclick="annHide('${a.id}')"`. `esc()` cannot protect this spot, because the browser turns `&#39;` back into `'` before it runs the handler. A staff account (or a stolen one) could save an announcement whose ID contains `');…code…('`. That code would then run for every student and parent who opens home.

**Fix:** the ID now goes into a `data-ann-id` attribute (escaped), and the handler reads it as plain data: `onclick="annHide(this.dataset.annId)"`. Same for `annDelete`. This is the pattern `duel.js` already used.

**Other IDs checked:** every other `onclick` that passes a record ID uses an ID that is either an Auth UID, a fixed list key, or one whose shape the rules already enforce. For example, `assignments` (bosses), `liveDrops`, `tournaments` and `notifications` all require `[A-Za-z0-9_-]`, and `examState` keys can only be the student's level number.

### S2, S3, S4 — Headers and deploy lists (fixed)

The same headers are now in `vercel.json` (live site) and `firebase.json` (Firebase Hosting):
- `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Vercel already sent this; now it is stated explicitly and also covers Firebase Hosting.
- `X-Frame-Options: DENY`. No page of the site is meant to be framed. The placement print frame is an empty `about:blank` frame, so it is not affected.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (camera, microphone, geolocation, payment and USB are all off).
- `Access-Control-Allow-Origin: https://eca-website-for-coach.vercel.app` instead of `*`. The site only loads its own files from its own origin, so nothing it uses needs CORS.

**`.vercelignore`** now also keeps these off the server: `tailwind.config.js`, `tailwind.input.css`, `.env*`, `.vs/`, `*.sql`, `*.bak` and `*.zip`.

**`firebase.json`** now also ignores: `*.log`, `rules-sim*.js`, `bump-version.js`, `*.sql`, `*.bak` and `*.zip`.

### S5 — Content Security Policy (partly fixed, enforcing it is manual)

The policy is sent as `Content-Security-Policy-Report-Only`, so the browser only warns and blocks nothing. I added `https://maps.google.com https://www.google.com` to `frame-src`, because the contact page map would have been blocked once enforced. I did not switch to enforcing, because Google sign-in, Lichess and the map can only be checked on the real site with a real login. A wrong policy would break login for everyone. See manual action 4.

## The 27-point checklist

Status key:
- ✅ **already in place:** verified, no change needed
- 🔧 **fixed:** changed now
- ⚠️ **manual:** needs you, in a console or a decision
- **N/A:** not applicable, with the reason

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Proper authentication | ✅ | **Login:** Firebase Auth verifies every sign-in on Google's servers; every Firestore request carries a token that Google checks. **Rules:** `notAnon()`, `isStaff()` and `isAdmin()` gate every path. **Deleted accounts:** blocked through `deleted/{uid}`. |
| 2 | Hide API keys | ✅ | **Only key in the code:** the Firebase web config `apiKey`. It is public by design: it names the project and grants nothing. Access is decided by the rules. **No real secrets:** no service-account key, Stripe key or other secret exists in the code or in the history. Restricting the web key is manual action 1. |
| 3 | Database ownership checks | ✅ | **Profiles:** a student can read and update only their own profile (`request.auth.uid == uid`), and `studentUpdateOk()` limits which fields change and by how much. **Staff, parents, admin:** staff can read students; parents only through `parentLinks`. Finance is admin-only, and so is deleting students. **Tests:** 412 emulator cases, including attacks. |
| 4 | Enforce HTTPS | ✅ | **Live site:** `http://` answers `308 Permanent Redirect` to `https://`, and HSTS is on. Firebase connections are always HTTPS or WSS. |
| 5 | Password hashing | ✅ | **Storage:** passwords go only to Firebase Auth, which hashes them with scrypt. No password is ever written to Firestore (checked `saveStudent`, signup, change password). **Generated passwords:** `crypto.getRandomValues`. |
| 6 | Server-side validation | ✅ | **Rules:** types, sizes, characters (`safeText`), allowed keys (`hasOnly`) and business limits. Examples: stars can't go negative, shop prices (`shopPrice`, `cosmeticPrice`), one reward per day per source, the level rises by one only after passing its exam. |
| 7 | XSS | 🔧 | **Fixed:** S1. **Templates:** every user value passes through `esc()`, which escapes `& < > " '`. **Other outputs:** milestones and toasts use `textContent`; WhatsApp and clipboard text uses `encodeURIComponent` or the clipboard. **Dangerous calls:** no `eval`, `new Function` or string `setTimeout`. **Rules:** `safeText()` also rejects `< > " ' \`` in names. |
| 8 | Suspicious activity monitoring | ⚠️ | **Already there:** client errors go to `errors/` (admin-only read). Firebase Auth throttles repeated failed logins by itself. **Manual:** alerts in Google Cloud (action 6). Logging failed logins from the browser would not help, because an attacker skips the browser. |
| 9 | Lock down admin routes | ✅ | **No `/admin` routes:** admin powers are checked in the rules (`isAdmin()`), not by hiding pages. **Becoming staff or admin:** only with a single-use invite code that only an admin can create; the role is copied from the code; `staff` documents can never be edited. |
| 10 | Parameterized queries | N/A | **No SQL:** Firestore queries are structured SDK calls, not strings, so there is nothing to inject. **IDs:** document IDs that users choose are checked with `.matches()` in the rules. |
| 11 | Environment variables | ✅ | **The only `.env` file:** `.env.local`, made by the Vercel CLI with one `VERCEL_OIDC_TOKEN`. It is local only and in `.gitignore`; it was never committed, and it is not on the live site (404). **Public prefixes:** no secrets with public or client prefixes exist. |
| 12 | Rate limiting | ⚠️ | **Already there:** Firebase Auth rate-limits sign-in, sign-up and password emails by itself. The rules limit how often the busy writes can happen: one reward per source and day, and emote throttling (`emoteRate`). **Manual:** turn on Firebase App Check (action 3) to stop scripts that are not your site. |
| 13 | Restrict CORS | 🔧 | **Fixed:** S3. Firestore and Auth CORS is managed by Google and protected by the rules and tokens. |
| 14 | Security headers | 🔧 | **Fixed:** S2 (HSTS, DENY, nosniff, Referrer-Policy, Permissions-Policy). **CSP:** still report-only (S5, action 4). |
| 15 | Secure cookies | N/A | **No cookies:** the site sets none (`document.cookie` is never used). Firebase keeps the login in IndexedDB and sends it as a token, not a cookie. |
| 16 | CSRF | N/A | **Why not needed:** CSRF needs a cookie that the browser attaches by itself. Here every request carries a Firebase token that another site cannot read or send. |
| 17 | Password reset links | ✅ / ⚠️ | **Today:** the site has no "forgot password" link. Coaches create student accounts, and logged-in users change their own password (`updatePassword`). **If you add one:** use Firebase `sendPasswordResetEmail`. Its links are random, single-use and expire after 1 hour (Firebase does not allow shorter). |
| 18 | File uploads | ✅ | **No uploads reach any server.** The only file input is the backup import, which is turned off and does nothing. **No Storage:** the site has no Firebase Storage. |
| 19 | Server-side price checks | ✅ | **No real money:** the shop uses stars, and the rules recompute every price (`shopPrice`, `cosmeticPrice`). A purchase must take exactly that price, and the balance can't go below zero. **Rewards:** fixed in the rules per source (for example, boss +10 ⭐). |
| 20 | Debug mode off | ✅ | **No debug build:** the only `console.log` is the diagnostics summary that the coach runs on purpose. **Errors:** users see short messages; full errors go only to `errors/` for the admin. **No tokens are logged.** |
| 21 | Vulnerable dependencies | ⚠️ | **`npm audit`:** 27 advisories (7 high, 20 moderate). All are in dev and test tools (`firebase-tools`, `firebase` and `@firebase/rules-unit-testing` for Node). None of that code is sent to visitors: the site loads Firebase 10.12.2 from Google's CDN, and the vulnerable parts (undici, grpc) are Node-only. **Not applied:** npm's suggested fix is a *downgrade* to older major versions. **Manual:** upgrade to the latest versions (action 5, needs your OK under the project rules). |
| 22 | Unused dependencies | ✅ | **All 6 dev packages are used:** `firebase-tools` by the npm scripts; `@firebase/rules-unit-testing` and `firebase` by the rules tests; `chess.js` and `stockfish` by `npm run vendor`; `tailwindcss` by `build:css`. **None ship to the site.** |
| 23 | Block sensitive files | 🔧 | **Fixed:** S4. **Checked on the live site:** `.env`, `.env.local`, `.git/config`, `.git/HEAD`, `firestore-debug.log`, `package.json`, `package-lock.json`, `firestore.rules`, `firebase.json`, `scripts/`, `rules-sim.js`, `*.md`, `.vercel/`, `.claudeignore` and `bump-version.js` all return 404. `tailwind.config.js` was 200 before this change. |
| 24 | Secrets in git history | ✅ | **Scanned:** every commit on every branch. **Found:** only one key, the Firebase web `apiKey` (the same key in every commit). **Never committed:** no `.env`, `.pem`, `.key`, service-account JSON, `.sql` or backup file. |
| 25 | Keys to revoke and rotate | ✅ | **Nothing to rotate.** The Firebase web key is public by design; restricting it (action 1) is enough. `VERCEL_OIDC_TOKEN` was never committed and expires by itself. |
| 26 | Full review | ✅ | **Areas covered:** authentication, roles, rules, secrets, headers and CORS, dependencies and the deploy file lists, as above. **Earlier audit:** the accepted risk from `SECURITY_AND_PERFORMANCE_AUDIT.md` still stands. H2: puzzle answers are readable in the browser; this needs a server. |
| 27 | Testing and report | ✅ | This report. **Tests:** E2E, both rules suites and the static audit all pass after the fixes. |

## Manual actions (only you can do these)

1. **Restrict the Firebase web API key.** In Google Cloud Console, open *APIs & Services → Credentials* and choose the "Browser key" of project `eca-chess`.
   - **Application restrictions:** HTTP referrers `https://eca-website-for-coach.vercel.app/*`, plus `http://localhost/*` for local testing.
   - **API restrictions:** Identity Toolkit API, Token Service API, Cloud Firestore API and Firebase Installations API.
   - No rotation is needed.
2. **Firebase Authentication settings.**
   - **Authorized domains:** keep only the live domain and `localhost`.
   - **Email enumeration protection:** turn it on.
   - **Password policy:** set a minimum length of 8, so the 8-character rule is also checked by Firebase and not only in the browser.
3. **Turn on App Check** (reCAPTCHA Enterprise) for Firestore and Authentication. It blocks scripts that are not your site.
   - **Code:** I can add it to `js/firebase.js` once you create a site key and send it to me.
   - **Order:** run it in "monitor" mode first, then enforce it.
4. **Enforce the CSP.**
   1. Open the live site with the browser's developer console open.
   2. Go through: Google login, email login, a lesson, puzzles, a duel, the placement test and the contact page map.
   3. If no `[Report Only]` CSP messages appear, rename the header `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `vercel.json` and `firebase.json`.
5. **Upgrade the dev tools** to their latest versions: `firebase-tools`, `firebase` (Node) and `@firebase/rules-unit-testing`. Then run all the tests again. This only affects your computer, not visitors.
6. **Monitoring.** In Google Cloud, set up:
   - a budget alert;
   - an alert on spikes in Firestore permission-denied errors and failed Auth sign-ins (Cloud Monitoring / Logging).

## Accepted risks

- **H2 (from the earlier audit):** puzzle and weekly-challenge answers are in files the browser downloads. Hiding them needs a server (a Cloud Function).
- **Self-reported scores:** rewards are capped and checked by the rules, but a student who edits the page code can still claim a reward they are allowed to get once a day without really playing. The rules limit the damage: fixed amounts, once per day per source, and only for their own account.
