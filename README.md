# ♟️ Egypt Chess Academy (ECA) — Training Platform

A bilingual (Arabic / English), installable web platform for **Egypt Chess Academy**. It gives coaches, students and parents one place for the training curriculum, daily practice, progress tracking, attendance, exams and certificates.

**Live site:** https://eca-website-for-coach.vercel.app/

## ✨ Features

### For students
- **🔁 Review mistakes:** missed puzzles come back after 1, 3, 7, 14 and 30 days.
- **♞ Lichess link + 📈 progress chart** in the parent dashboard.
- **📢 Academy announcements** on the home page.
- **📚 Curriculum (Steps 1–6):** lessons linked to Lichess studies, showing only the student's current level, with a "next lesson" shortcut.
- **🎮 Training Arena:** play against Stockfish bots at several levels, solve Lichess puzzles on a board, train board vision, play the pawn game, and analyse positions (FEN / PGN).
- **🧩 Promotion exams:** timed puzzle tests at the end of each step. Puzzles lock after the first attempt.
- **🏅 Ranks, badges and honor list.**
- **🎓 Certificates:** Arabic and English, downloadable as image or PDF, all kept under "My Certificates".
- **👨‍👩‍👧 Parent dashboard:** attendance, homework, puzzle accuracy and the coach's note, viewable inside the student account.

### For coaches
- **📄 Monthly parent reports:** one-page PDF (Arabic/English) shared to WhatsApp in one tap.
- **⚔️ Internal tournaments:** Swiss or round robin, one-tap results, automatic standings with tie-breaks.
- **📅 Today screen:** today's classes per group schedule, quick attendance, students with repeated absences, outstanding fees (admin), and ready-made WhatsApp reminders.
- **👥 Student tracker:** attendance and homework per lesson, groups, and a private note for parents.
- **✅ Attendance:** separate online and offline sections, day-by-day navigation, monthly report with CSV export.
- **➕ Student management:** add, edit, move between online/offline, delete, plus backup and restore.
- **💰 Finance dashboard (admin only):** fees, payments, remaining balances and analytics.
- **🔗 Parent codes:** generate a follow-up code for each parent and send it through WhatsApp.

### General
- **🌐 Arabic / English toggle** across the whole interface.
- **🌗 Dark (black & gold) and light themes.**
- **📲 PWA:** installable on phones, works offline, responsive on mobile.
- **🔍 Student search** that keeps focus while typing, and **browser back button** navigation between pages.

## 🧱 Tech stack
- Plain HTML, CSS and JavaScript, styled with a prebuilt Tailwind CSS file (`npm run build:css`)
- **Firebase** Authentication (email/password, anonymous for parents, Google) and Firestore
- chess.js and Stockfish.js for the Arena
- Lichess puzzle data (CC0) and Lichess study links
- Hosted on **Vercel**

## 📁 Repository structure

| File | Purpose |
|---|---|
| `index.html` | Page shell: markup, custom styles, script/style links |
| `js/core.js` | Curriculum, dictionary, router, student/coach pages, attendance, exams, certificates |
| `js/arena.js` | Training Arena: bots, puzzles, board vision |
| `js/streaks.js` | Student streak card (🔥 + week dots) and weekly badges |
| `js/reports.js` | Monthly parent report: canvas → PDF, share/download |
| `js/tournaments.js` | Internal tournaments: Swiss / round robin pairing, results, standings |
| `js/review.js` | Spaced-repetition review of missed arena puzzles |
| `js/quality.js` | Undo after deleting a student, weekly backup reminder, admin error log |
| `js/announce.js` | Academy announcements (coach posts, students see on home) |
| `js/progress.js` | 6-month progress chart and Lichess account linking |
| `js/today.js` | Coach "Today" screen, group schedules, WhatsApp reminder messages |
| `js/extras.js` | Analysis board, pawn game, ranks/XP, honor list, info pages, footer |
| `js/firebase.js` | Firebase Auth + Firestore layer, finance dashboard (ES module) |
| `puzzles.js` | Exam puzzle bank: 1000 Lichess puzzles (200 per difficulty), lazy-loaded only when needed |
| `tailwind.css` | Prebuilt Tailwind CSS (generated — do not edit by hand) |
| `tailwind.config.js`, `tailwind.input.css`, `package.json` | Tailwind build setup |
| `scripts/bump-version.js` | Bumps the `eca-vN` version in `index.html` and `sw.js` |
| `sw.js` | Service worker for offline support. Bump `VERSION` after each update |
| `manifest.json` | PWA manifest |
| `firestore.rules` | Firestore security rules |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | App icons |
| `SETUP-AR.md` | Step-by-step security setup (Arabic) |

## 🚀 Getting started
1. Clone the repo and open `index.html` in a browser, or serve the folder with any static server.
2. Create a Firebase project, enable **Email/Password** and **Anonymous** sign-in, and put your web config in the `firebaseConfig` object in `index.html`.
3. Publish `firestore.rules` in the Firestore console.
4. Add your coach account to the `staff` collection as described in [`SETUP-AR.md`](SETUP-AR.md).
5. Deploy the folder to Vercel (or any static host).

## 🔐 Security notes
- The Firebase web config is public by design. Access is controlled by `firestore.rules`.
- Staff accounts are created manually in the Firebase console. The `admin` role is required for finance data.
- Parents access a single student through a code, with no list access to other students.
- Puzzle and exam results go through a create-only `attempts` ledger; rules only let a student's counters grow by one per new attempt, lock exam results once set, and allow a level-up only together with a passed exam.

## 🔄 Updating
1. One time only: `npm install`
2. After editing: `npm run release` (rebuilds `tailwind.css` and bumps the version in `index.html` + `sw.js`)
3. Commit and push. Vercel serves the folder as static files.

If you only changed text/logic and used no new Tailwind classes, `npm run bump` is enough.
