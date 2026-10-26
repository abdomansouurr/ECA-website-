// ECA — homework.js (eca-v20): واجب الألغاز التفاعلي — البيانات + اللاعب
// البيانات متولدة من دروس Lichess الخاصة بالكوتش (scripts/hw-build.js)

// ECA — بيانات واجب الألغاز (متولدة من دروس Lichess الخاصة بالكوتش — eca-v20)
// f = FEN، m = سطر الحل UCI (أول نقلة هي الإجابة)، alts = حلول أولى بديلة مقبولة، reading = واجب قراءة بس
window.ECA_HOMEWORK = {"1-0":{"src":"https://lichess.org/study/jjMNw6GF/wWxeB9BO","reading":true},"1-1":{"src":"https://lichess.org/study/48k26G0o/gvaJW7s5","reading":true},"1-2":{"src":"https://lichess.org/study/C4BqIzIc/HO9ETmkV","reading":true},"1-3":{"src":"https://lichess.org/study/TCt9XgBc/hgBwh3xP","puzzles":[{"f":"7k/p7/5p2/3P4/8/6P1/1P6/7K w - - 0 1","m":["b2b4","f6f5","b4b5","a7a5","b5a6"],"alts":[]}]},"1-4":{"src":"https://lichess.org/study/RPFaVRku/LErAf9Dq","puzzles":[{"f":"r1q2rk1/3b2pp/pnp5/P2p4/1P1Pp3/1QN1P3/3B1PPP/1R3RK1 b - - 0 1","m":["b6c4"],"alts":[]}]},"1-5":{"src":"https://lichess.org/study/LJzsX2Bb/1o4kmKsF","puzzles":[{"f":"2k5/1pp4p/p1n5/6r1/8/2B5/PP3P1P/5RK1 w - - 0 1","m":["g1h1"],"alts":[]}]},"1-6":{"src":"https://lichess.org/study/2HFYM7LI/iNAIUMgw","puzzles":[{"f":"6rk/8/2K2p2/8/7p/8/8/2Q5 w - - 0 1","m":["c1h6"],"alts":["c1c5"]}]},"1-7":{"src":"https://lichess.org/study/WakS7KEt","puzzles":[{"f":"6k1/1p3ppp/nq3b2/8/2Q5/BP5P/r4PP1/4R1K1 w - - 0 1","m":["e1e8"],"alts":[]}]},"1-8":{"src":"https://lichess.org/study/8XJxZK1c/g0194InP","reading":true},"1-9":{"src":"https://lichess.org/study/jDKpfwHS","puzzles":[{"f":"r4rk1/pp3p2/1q1R1bpp/8/8/4P3/1P1QBPPP/5RK1 w - - 0 1","m":["d6b6","a7b6","g1h1","f8d8","d2c2","a8c8","e2c4","g8h7"],"alts":[]}]},"1-10":{"src":"https://lichess.org/study/hs7q4Bey","puzzles":[{"f":"r4rk1/pp2qpp1/1b2p2p/4n3/3pPB2/1N3nP1/PP2QPBP/R4R1K w - - 0 1","m":["g2f3","d4d3","e2d1","e5f3","d1f3","e6e5","f4c1","a7a5"],"alts":[]}]},"1-11":{"src":"https://lichess.org/study/4L5NDH4W/Ufe7WXKh","puzzles":[{"f":"K7/P1q4k/6P1/8/8/8/8/8 b - - 0 1","m":["h7g8","g6g7","c7c8"],"alts":[]}]},"2-0":{"src":"https://lichess.org/study/Xm0oBMLW","puzzles":[{"f":"5rk1/pb2np2/1p4p1/8/8/6N1/PPQ3PP/6K1 w - - 0 1","m":["c2c7","e7c6","c7b7","c6d4","g1f2","f8d8","b7c7","d4e6"],"alts":[]}]},"2-1":{"src":"https://lichess.org/study/zTSQXHWV","puzzles":[{"f":"4r1k1/pp2qppp/2b5/2P4N/8/6QP/PP4P1/5RK1 b - - 0 1","m":["e7c5","g1h2","c5h5","b2b4","g8h8","b4b5","c6b5","f1e1"],"alts":[]}]},"2-2":{"src":"https://lichess.org/study/zWSgnN2h","puzzles":[{"f":"r1bqkb1r/ppppnp1p/6p1/4n3/2BNP3/5Q2/PPP2PPP/RNB1K2R w - - 0 1","m":["f3f6","e5c4","f6h8"],"alts":[]}]},"2-3":{"src":"https://lichess.org/study/v6l4lLFw/LralQmQS","puzzles":[{"f":"2kr4/p2n2bp/1pp3p1/3p1p2/3P1B2/2P3P1/PP2rPBP/R2R2K1 w - - 0 1","m":["g2f1","g6g5","f1e2","g5f4","e2d3","d8f8","g3f4","f8h8"],"alts":[]}]},"2-4":{"src":"https://lichess.org/study/yZMV5JdY/9HFnCNVx","reading":true},"2-5":{"src":"https://lichess.org/study/Tv5Q4AGE/JWFraj6A","reading":true},"2-6":{"src":"https://lichess.org/study/THHzDa1N/C9EZ0z5O","puzzles":[{"f":"5k2/5rq1/p1p1Q2R/1p2P3/6p1/P7/1PP4P/7K w - - 0 1","m":["e6c8","f8e7","h6e6"],"alts":[]}]},"2-7":{"src":"https://lichess.org/study/otSMJjwH/pIwu0ivp","reading":true},"2-8":{"src":"https://lichess.org/study/zAGZus6e/5AJW3cs7","puzzles":[{"f":"6k1/5R2/6K1/8/8/8/8/8 w - - 0 1","m":["f7f6","g8h8","f6f8"],"alts":[]}]},"2-9":{"src":"https://lichess.org/study/whl4X0Vy/BPFGoXvj","reading":true},"2-10":{"src":"https://lichess.org/study/ZOdpD9Ly/O9zAPm3h","puzzles":[{"f":"r3rnk1/1p3ppp/p7/1q1P4/4b3/P4RN1/1B1Q2PP/R6K w - - 0 1","m":["d2d4","f7f6","g3e4","e8e4","d4e4","b5b2","f3f1","a8d8"],"alts":[]}]},"2-11":{"src":"https://lichess.org/study/a5Q2Twk2/dP4F5lD9","puzzles":[{"f":"8/1r6/1B6/4k3/8/8/4K3/1R6 w - - 0 1","m":["b6d4","e5d4","b1b7"],"alts":[]}]},"2-12":{"src":"https://lichess.org/study/8YoxQqtw/3I15qJzf","reading":true},"2-13":{"src":"https://lichess.org/study/9G0jITgq","puzzles":[{"f":"q5k1/1r3pp1/p4b1p/2p5/1p6/1B1P4/P1P2PPP/3QR1K1 w - - 0 1","m":["b3d5","f6c3","d5b7","a8b7","e1e8","g8h7","d1g4","c5c4"],"alts":[]}]},"3-0":{"src":"https://lichess.org/study/srYNhk2o","puzzles":[{"f":"2k5/3q4/8/3P4/2B5/8/8/1KR5 w - - 0 1","m":["c4b5"],"alts":[]}]},"3-1":{"src":"https://lichess.org/study/R7MF7lb4","puzzles":[{"f":"r1b1R3/pp4pk/2p5/8/2P5/1P3B2/P5P1/6K1 w - - 0 1","m":["f3g4","b7b6","g4c8"],"alts":["e8c8"]}]},"3-2":{"src":"https://lichess.org/study/LdwLPyPK","reading":true},"3-3":{"src":"https://lichess.org/study/oZ0xi9dr","puzzles":[{"f":"8/8/8/3P4/8/8/7k/K7 w - - 0 1","m":["d5d6","h2g3","d6d7","g3f4","d7d8q"],"alts":[]}]},"3-4":{"src":"https://lichess.org/study/xrekdf0f/RCd5Ztfm","puzzles":[{"f":"2k4r/ppp2p1p/4p1n1/q7/1n5B/2Q2N2/PPP2PPP/3R2K1 w - - 0 1","m":["c3h8","g6h8","d1d8"],"alts":[]}]},"3-5":{"src":"https://lichess.org/study/Vh0XG74a/WmCoeGe5","reading":true},"3-6":{"src":"https://lichess.org/study/OWsq2BB6/Us22qb9A","reading":true},"3-7":{"src":"https://lichess.org/study/2SV6ZvX7/06csTyjJ","puzzles":[{"f":"8/1pk2p2/6p1/R5K1/2pP4/2P5/1P4P1/7r b - - 0 1","m":["h1h5"],"alts":[]}]},"3-8":{"src":"https://lichess.org/study/dMXnI1aK","puzzles":[{"f":"4k3/1ppr2p1/5n1p/1B6/1P6/4PP2/P4K1P/3R4 b - - 0 1","m":["c7c6"],"alts":[]}]},"3-9":{"src":"https://lichess.org/study/mSAOaeqN/eYak86eR","reading":true},"3-10":{"src":"https://lichess.org/study/kP7xaVHA/irKTLPXb","puzzles":[{"f":"2k5/8/3K4/2P5/8/8/8/8 w - - 0 1","m":["d6c6","c8b8","c6d7","b8b7","c5c6","b7b8","c6c7","b8b7"],"alts":[]}]},"3-11":{"src":"https://lichess.org/study/x1vTVIn2/IKdbD71Q","puzzles":[{"f":"r1bqk2r/ppppn1pp/5n2/1B1P2N1/1b6/2N5/PP3PPP/R1BQK2R w - - 0 1","m":["g5e6"],"alts":[]}]},"4-0":{"src":"https://lichess.org/study/t5pXfLox/34DdnZYk","reading":true},"4-1":{"src":"https://lichess.org/study/6BtkIYoH/jyX4KueF","reading":true},"4-2":{"src":"https://lichess.org/study/Gwg29Hxj/Y6li8kPN","puzzles":[{"f":"4rk2/1q3pp1/4P3/8/1b5Q/8/8/3K3R w - - 0 1","m":["e6e7","b4e7","h4h8"],"alts":[]}]},"4-3":{"src":"https://lichess.org/study/t1PGCxRF","reading":true},"4-4":{"src":"https://lichess.org/study/pibm2ud9/lDYc6ebt","reading":true},"4-5":{"src":"https://lichess.org/study/wrm58f4j/ZnUsBj0n","puzzles":[{"f":"8/8/8/8/8/1B1k1K2/3pp3/8 w - - 0 1","m":["b3c4","d3c4","f3e2","c4c3","e2d1"],"alts":[]}]},"4-6":{"src":"https://lichess.org/study/uNWgETUd/XtI3rvDK","puzzles":[{"f":"r6r/pb1k1p2/2nPp3/2b4p/1pP1B1q1/3Q1NB1/1P3PPP/R2R2K1 w - - 0 1","m":["e4c6","d7c6","f3e5","c6b6","e5d7","b6c6","d7c5","h5h4"],"alts":[]}]},"4-7":{"src":"https://lichess.org/study/HDoz7iiZ/jtw6t01P","puzzles":[{"f":"5k1r/pp3pp1/n1p4p/5N2/7Q/8/PqPr1PPP/R3R1K1 w - - 0 1","m":["e1e8","f8e8","h4e7"],"alts":[]}]},"4-8":{"src":"https://lichess.org/study/pvepHzju/NzJust3T","reading":true},"4-9":{"src":"https://lichess.org/study/Vslcoxz5/4s1QtXma","puzzles":[{"f":"3qkb1r/p1p3pp/b3p3/nr3p2/8/P4NP1/1PQNPPBP/R3K2R w - - 0 1","m":["b2b4","f8e7","a1d1","c7c5","b4a5","d8a5"],"alts":[]}]},"4-10":{"src":"https://lichess.org/study/zz7pwo79/NNBE4uIt","puzzles":[{"f":"2k5/P4p2/3Rp3/1P1p4/5K2/8/8/r7 w - - 0 1","m":["d6a6","a1a6","b5a6","c8c7","a7a8q"],"alts":[]}]},"4-11":{"src":"https://lichess.org/study/eo7JyYza/ka7GUiIW","puzzles":[{"f":"6k1/pp3pbp/6p1/7q/2P3nP/PBN2PP1/1P6/3Q2K1 b - - 0 1","m":["h5c5","g1h1","g4f2","h1g2","f2d1","b3d1","c5f8","d1a4"],"alts":[]}]},"4-12":{"src":"https://lichess.org/study/C1bi0HTS/HtyfEmM3","puzzles":[{"f":"5r1k/p3qp1p/bpr2b2/3p4/3B3P/4P3/PPP3Q1/1KR3R1 w - - 0 1","m":["g2g7","f6g7","d4g7","h8g8","g7f6"],"alts":[]}]},"4-13":{"src":"https://lichess.org/study/7ojMv2O2","puzzles":[{"f":"6k1/p1B2ppp/3n1q2/3Q4/3P4/P5P1/1r1r3P/R4RK1 b - - 0 1","m":["f6d4","d5d4","d2g2","g1h1","g2h2","h1g1","b2g2"],"alts":[]}]},"4-14":{"src":"https://lichess.org/study/MTh6EjHF/8TaknmFZ","puzzles":[{"f":"8/4p3/8/5P2/8/2k4P/8/1K6 w - - 0 1","m":["f5f6","e7f6","h3h4","c3d4","h4h5","d4e5","h5h6","e5e6"],"alts":[]}]},"4-15":{"src":"https://lichess.org/study/1Joelo2c","puzzles":[{"f":"6k1/Q4pp1/4pq1p/8/8/p7/r4PPP/3R2K1 w - - 0 1","m":["a7b8","g8h7","b8b1","f6g6","b1a2"],"alts":[]}]},"4-16":{"src":"https://lichess.org/study/WQZY2uhR","reading":true},"4-17":{"src":"https://lichess.org/study/HyE8ZFrO","puzzles":[{"f":"8/8/8/Q5K1/8/3k4/2p5/8 w - - 0 1","m":["a5e1","d3c4","g5f5","c4b3","e1c1"],"alts":[]}]},"5-0":{"src":"https://lichess.org/study/ZSiXyT40/qo6SXDlt","reading":true},"5-1":{"src":"https://lichess.org/study/4kbUV3tO/3LguClAn","puzzles":[{"f":"1q4r1/p5pk/1p2r2p/3pNp1P/P2P4/1P4Q1/2P5/K5R1 w - - 0 1","m":["g3g6","e6g6","h5g6","h7h8","e5f7"],"alts":[]}]},"5-2":{"src":"https://lichess.org/study/yCKqwlXK/RiNVgrf6","puzzles":[{"f":"8/1pp5/p7/1PP5/P2k4/8/3K4/8 w - - 0 1","m":["c5c6","b7c6","b5a6","d4c5","a6a7","c5b6","a7a8q"],"alts":[]}]},"5-3":{"src":"https://lichess.org/study/PQ7JcSOS/dNkZ0QBc","puzzles":[{"f":"8/8/3k4/3r4/3R4/3PK3/8/8 w - - 0 1","m":["e3e4","d5d4","e4d4","d6c6","d4e5","c6b5","e5d5","b5b4"],"alts":[]}]},"5-4":{"src":"https://lichess.org/study/8wlJJFgR/y1kgDU5P","reading":true},"5-5":{"src":"https://lichess.org/study/mE6rkIxV/33oS3dA7","puzzles":[{"f":"8/8/6PK/8/k7/p7/8/8 w - - 0 1","m":["g6g7","a4b3","g7g8q","b3b2","g8g7","b2b1","g7g1","b1b2"],"alts":[]}]},"5-6":{"src":"https://lichess.org/study/mE6rkIxV/8dRywK39","reading":true},"5-7":{"src":"https://lichess.org/study/57XhbPB3/afi99YM8","puzzles":[{"f":"1n6/1P4p1/6k1/p7/4N3/P6Q/K6p/4q3 w - - 0 1","m":["h3e6","g6h5","e4f6","g7f6","e6e1"],"alts":[]}]},"5-8":{"src":"https://lichess.org/study/57XhbPB3/MvLHjVgH","puzzles":[{"f":"r4rk1/ppq2ppp/2p1p1n1/3p4/2PP4/1PNQP3/P4PPP/2R2RK1 w - - 0 1","m":["c4d5","e6d5","c3d5"],"alts":[]}]},"5-9":{"src":"https://lichess.org/study/VLebVUHz","reading":true},"5-10":{"src":"https://lichess.org/study/ixNQgC8m","puzzles":[{"f":"1R6/2K5/8/2k5/1p6/8/8/8 w - - 0 1","m":["c7b7","c5b5","b7a7","b5a4","a7b6","a4a3","b6b5","b4b3"],"alts":[]}]},"5-11":{"src":"https://lichess.org/study/NZtUAixb","reading":true},"5-12":{"src":"https://lichess.org/study/tqz28nOS/lAclawnI","puzzles":[{"f":"2rr1k2/p4p1Q/1pq2bpp/3N4/8/P2R3P/1P3PP1/4R1K1 w - - 0 1","m":["d5e7","f6e5","e7c6","e5g7","c6d8","c8c7","d8f7","g7f6"],"alts":[]}]},"5-13":{"src":"https://lichess.org/study/ILOZM4m9","puzzles":[{"f":"1k6/1pp5/4p2p/Q2p4/1P1P4/5bPq/B4P1P/R3R1K1 w - - 0 1","m":["a5a8","b8a8","a2d5","a8b8","d5f3","h3f5","e1e3","f5b5"],"alts":[]}]},"5-14":{"src":"https://lichess.org/study/G5ILgPOq","puzzles":[{"f":"7R/K7/8/k7/Pp6/1r6/8/8 w - - 0 1","m":["h8a8","b3b1","a7b7"],"alts":[]}]},"5-15":{"src":"https://lichess.org/study/G5ILgPOq/WUnq8bNf","puzzles":[{"f":"r4r2/5q1k/6Rp/p3pP2/1pn4P/5PQ1/PPP3P1/2K4R w - - 0 1","m":["g3g5","h7h8","g6h6","f7h7","h6h7","h8h7","g5h5","h7g7"],"alts":[]}]},"5-16":{"src":"https://lichess.org/study/kFBNSeRd","puzzles":[{"f":"r1b2k1r/pp4pp/2pp2p1/4p3/4P3/1B1P4/PPPR1PPP/5RK1 w - - 0 1","m":["f2f4","e5f4","f1f4"],"alts":[]}]},"5-17":{"src":"https://lichess.org/study/4QvAxjvr","reading":true},"5-18":{"src":"https://lichess.org/study/6bKfsHPR","puzzles":[{"f":"8/k7/8/PK6/8/8/8/3B4 w - - 0 1","m":["d1f3","a7b8","b5b6","b8c8","b6c6","c8d8","f3g4","d8e8"],"alts":[]}]}};

// ECA — homework.js (eca-v20): واجب الألغاز التفاعلي جوه المنصة
// الطالب بيحل مواقف الواجب على رقعة المنصة، بنحسب كام إجابة صح من أول محاولة، ويقدر يعيد الحل.
// الكوتش بيشوف النتيجة في «متابعة الطلاب»، والطالب بيشوفها جنب زر الواجب في الدروس.

// ===== لاعب الواجب =====
let HWChess = null;
import("https://cdn.jsdelivr.net/npm/chess.js@1.0.0/+esm").then(m => { HWChess = m.Chess; if (tab === "homework") render(); }).catch(() => {});

const HW = { key: null, entry: null, i: 0, game: null, sol: [], alts: [], idx: 0, color: "w", flip: false,
             sel: null, last: null, flash: null, status: "play", wrongThis: false, firstTry: [], finished: false };
const hwT = (ar, en) => lang === "en" ? en : ar;   // ترجمة محلية آمنة (من غير DICT عشان ما ندوش نصوص تانية)

function hwLessonTitle(key) {
  const p = String(key).split("-"), st = STEPS.find(x => x.step === Number(p[0]));
  const les = st && st.lessons[Number(p[1])];
  return les ? les.t : "Homework";
}
function hwEntry(key) { return (typeof window.ECA_HOMEWORK === "object") ? window.ECA_HOMEWORK[key] : null; }

function openHomework(key) {
  const e = hwEntry(key); if (!e) return;
  HW.key = key; HW.entry = e; HW.finished = false;
  go("homework"); hwStartAttempt();
}
function hwStartAttempt() {
  clearTimeout(HW.demoTimer);
  HW.i = 0; HW.finished = false;
  const ps = (HW.entry && HW.entry.puzzles) || [];
  HW.firstTry = ps.map(() => true);
  if (ps.length) hwLoadPuzzle(); else HW.game = null;
  render();
}
function hwLoadPuzzle() {
  clearTimeout(HW.demoTimer);
  const p = HW.entry.puzzles[HW.i];
  let g = null; try { g = HWChess ? new HWChess(p.f) : null; } catch (_) {}
  HW.game = g; HW.sol = (p.m || []).slice(); HW.alts = (p.alts || []).slice();
  HW.idx = 0; HW.color = g ? g.turn() : "w"; HW.flip = HW.color === "b";
  HW.sel = null; HW.last = null; HW.flash = null; HW.status = g ? "play" : "error";
}
function hwClick(sq) {
  if (!HW.game || HW.status !== "play" || HW.idx !== 0 || !HWChess) return;
  const mv = pickOrMove(HW, sq, HW.color);
  if (!mv) return render();
  let r = null; try { r = HW.game.move(mv); } catch (_) {}
  if (!r) return render();
  const u = r.from + r.to + (r.promotion || ""), want = HW.sol[0] || "";
  const ok = u.slice(0, 4) === want.slice(0, 4) || HW.alts.some(a => a.slice(0, 4) === u.slice(0, 4)) || HW.game.isCheckmate();
  HW.last = [r.from, r.to];
  if (!ok) {
    HW.status = "wrong"; HW.flash = { [r.to]: "bad" }; HW.wrongThis = true; render();
    setTimeout(() => { if (HW.status !== "wrong") return; try { HW.game.undo(); } catch (_) {} HW.flash = null; HW.last = lastOf(HW.game); HW.status = "play"; render(); }, 750);
    return;
  }
  HW.firstTry[HW.i] = !HW.wrongThis;
  HW.idx = 1; HW.flash = { [r.to]: "good" }; HW.status = "solved"; HW.sel = null;
  render();
  hwDemoRest();
}
function hwDemoRest() {
  const g = HW.game;
  const step = () => {
    if (HW.game !== g || HW.idx >= HW.sol.length || g.isCheckmate()) return render();
    try { const r = uciMove(g, HW.sol[HW.idx]); HW.last = [r.from, r.to]; } catch (_) { HW.idx = HW.sol.length; return render(); }
    HW.idx++; render();
    HW.demoTimer = setTimeout(step, 650);
  };
  HW.demoTimer = setTimeout(step, 550);
}
function hwShowSolution() {
  if (!HW.game || HW.status !== "play") return;
  HW.wrongThis = true; HW.firstTry[HW.i] = false;
  try { const r = hwUciMove(HW.sol[0]); HW.last = [r.from, r.to]; } catch (_) {}
  HW.idx = 1; HW.flash = null; HW.status = "solved"; HW.sel = null;
  render(); hwDemoRest();
}
function hwNext() {
  clearTimeout(HW.demoTimer);
  HW.i++;
  if (HW.i >= (HW.entry.puzzles || []).length) return hwFinish();
  hwLoadPuzzle(); render();
}
function hwFinish() {
  const t = (HW.entry.puzzles || []).length, ft = HW.firstTry.filter(Boolean).length;
  const u = currUser();
  if (u && u.role === "student" && HW.key) {
    u.hwp = u.hwp || {};
    const prev = u.hwp[HW.key];
    u.hwp[HW.key] = { ft, t, att: ((prev && prev.att) || 0) + 1, ts: Date.now() };
    if (typeof markActiveDay === "function") markActiveDay(u);
    save();
  }
  HW.finished = true; render();
}
function hwRetry() { hwStartAttempt(); }
function hwExit() { go("lessons"); render(); }
// ثيم الرقعة جوه اللاعب — نفس الإعدادات العامة (ألوان Lichess + شكل القطع)
function hwSetTheme(l, d) { setBoardColor("l", l); setBoardColor("d", d); render(); }
function hwSetPieces(k) { setPieceSet(k); render(); }

function renderHomeworkPlayer(u) {
  const e = HW.entry;
  const hwBack = `<button onclick="hwExit()" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">${hwT("← رجوع للدروس", "← Back to lessons")}</button>`;
  if (!e || !HW.key) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-gray-300">${hwT("افتح الواجب من صفحة الدروس — اضغط زر «Homework» جنب الدرس.", "Open the homework from the lessons page — tap the Homework button next to the lesson.")}</p>
      <div class="mt-4">${hwBack}</div></div>`;
  const title = hwLessonTitle(HW.key);
  const srcLink = `<a href="${e.src}" target="_blank" rel="noopener" class="text-[11px] text-sky-400 hover:underline">${hwT("فتح الواجب على Lichess ↗", "Open homework on Lichess ↗")}</a>`;

  // واجب قراءة (مفيش موقف قابل للحل)
  if (e.reading || !e.puzzles || !e.puzzles.length) {
    return `<div class="max-w-xl mx-auto space-y-4 mt-4">
      <div class="gold-card rounded-2xl p-6 text-center space-y-3">
        <div class="text-xs text-gray-400">${hwT("واجب —", "Homework —")} ${esc(title)}</div>
        <h2 class="font-display font-bold text-xl gold-gradient-text">${hwT("الواجب ده للقراءة", "This homework is for reading")}</h2>
        <p class="text-xs text-gray-400">${hwT("الدرس ده واجبه شرح ومواقف على Lichess — افتحه وخلّي الكوتش يعلم لك إنك حللته.", "This lesson's homework is explanation & positions on Lichess — open it, and the coach will tick it for you.")}</p>
        <a href="${e.src}" target="_blank" rel="noopener" class="inline-block px-4 py-2 rounded-xl text-xs gold-btn">${hwT("فتح الواجب على Lichess ↗", "Open homework on Lichess ↗")}</a>
        <div>${hwBack}</div>
      </div></div>`;
  }

  // ملخص النتيجة بعد الخلاص
  if (HW.finished) {
    const t = e.puzzles.length, ft = HW.firstTry.filter(Boolean).length;
    const perfect = ft === t;
    return `<div class="max-w-xl mx-auto space-y-4 mt-4">
      <div class="gold-card rounded-2xl p-8 text-center space-y-4">
        <div class="text-5xl">${perfect ? "🏆" : "💪"}</div>
        <h2 class="font-display font-bold text-2xl ${perfect ? "text-emerald-300" : "text-yellow-300"}">${perfect ? hwT("برافو! الواجب كله صح من أول محاولة", "Bravo! All homework solved first try") : hwT("خلصت الواجب — ممكن أحسن", "Homework done — you can do better")}</h2>
        <div class="text-lg font-extrabold text-white">${hwT("النتيجة:", "Score:")} <span class="${perfect ? "text-emerald-300" : "text-yellow-300"}">${ft} ${hwT("من", "of")} ${t}</span> ${hwT("صح من أول محاولة", "correct on the first try")}</div>
        <p class="text-xs text-gray-400">${hwT("الكوتش هيشوف النتيجة في «متابعة الطلاب» — وتقدر تعيد الحل في أي وقت.", "The coach will see the result in the Students tracker — you can retry anytime.")}</p>
        <div class="flex flex-wrap justify-center gap-2 pt-2">
          <button onclick="hwRetry()" class="tap rounded-xl text-xs gold-btn">${hwT("↺ إعادة المحاولة", "↺ Retry")}</button>
          ${hwBack}
        </div>
        <div>${srcLink}</div>
      </div></div>`;
  }

  // شاشة الحل
  if (!HWChess) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-gray-300">${hwT("جاري تحميل مكتبة الشطرنج... لو اتفضلت كده طويل، اتأكد من الإنترنت.", "Loading the chess library... if it takes long, check your internet.")}</p>
      <div class="mt-3">${hwBack}</div><div class="mt-2">${srcLink}</div></div>`;
  if (!HW.game) return `<div class="max-w-xl mx-auto gold-card rounded-2xl p-8 text-center mt-6">
      <p class="text-sm text-red-300">${hwT("تعذّر تحميل موقف الواجب — افتحه على Lichess بدل كده.", "Could not load the homework position — open it on Lichess instead.")}</p>
      <div class="mt-3">${hwBack}</div><div class="mt-2">${srcLink}</div></div>`;

  const ps = e.puzzles;
  const u2 = currUser();
  const attN = u2 && u2.hwp && u2.hwp[HW.key] ? (u2.hwp[HW.key].att || 0) + 1 : 1;
  const tot = ps.length;
  // عدّاد واضح من أول لغز: الطالب يعرف من البداية عليه يحل كام لغز
  const doneN = Math.min(HW.i + (HW.status === "solved" ? 1 : 0), tot);
  const pct = tot ? Math.round((doneN / tot) * 100) : 0;
  const goalTxt = tot === 1 ? hwT("عليك حل لغز واحد", "1 puzzle to solve")
    : hwT("عليك حل", "You'll solve") + ` ${tot} ` + hwT("ألغاز", "puzzles");
  const hwThemeBtns = (typeof BOARD_THEMES !== "undefined" ? BOARD_THEMES : []).map(t => {
    const on = boardColors.l === t[1] && boardColors.d === t[2];
    return `<button onclick="hwSetTheme('${t[1]}','${t[2]}')" title="${t[0]}" aria-pressed="${on}" class="w-7 h-7 rounded-lg border ${on ? "border-yellow-400 ring-2 ring-yellow-400/40" : "border-yellow-500/30"}" style="background:linear-gradient(135deg, ${t[1]} 50%, ${t[2]} 50%)"></button>`;
  }).join("");
  const hwPieceBtns = (typeof PIECE_SETS !== "undefined" ? PIECE_SETS : []).map(pk => `<button onclick="hwSetPieces('${pk[0]}')" aria-pressed="${pieceSet === pk[0]}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${pieceSet === pk[0] ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">${pk[1]}</button>`).join("");
  const sideTxt = HW.color === "w" ? hwT("انت بالأبيض", "You are White") : hwT("انت بالأسود", "You are Black");
  const status = HW.status === "wrong" ? hwT("مش دي النقلة — جرّب تاني", "Not this move — try again")
    : HW.status === "solved" ? (HW.firstTry[HW.i] ? hwT("صح! من أول محاولة ✓", "Correct! First try ✓") : hwT("صح! (بعد محاولة غلط)", "Correct! (after a wrong try)"))
    : hwT("لاقي أحسن نقلة —", "Find the best move —") + " " + sideTxt;
  const stCls = HW.status === "wrong" ? "text-red-300" : HW.status === "solved" ? "text-emerald-300" : "text-yellow-300";
  const solvedAll = HW.status === "solved";
  return `
    <div class="max-w-5xl mx-auto grid lg:grid-cols-5 gap-5 mt-2">
      <div class="min-w-0 lg:col-span-3 space-y-3">
        <div class="gold-card rounded-2xl p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-yellow-300">🎯 ${goalTxt}</span>
            <span class="text-xs font-extrabold text-white" dir="ltr">${HW.i + 1}/${tot}</span>
          </div>
          <div class="h-2.5 rounded-full bg-black/60 border border-yellow-500/20 overflow-hidden mb-3" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${doneN}">
            <div class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300" style="width:${pct}%"></div>
          </div>
          ${boardHTML({ game: HW.game, flip: HW.flip, sel: HW.sel, targets: targetsOf(HW.game, HW.sel), last: HW.last, flash: HW.flash, onClick: "hwClick" })}
        </div>
        <div class="gold-card rounded-2xl p-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-gray-400">
          <span class="font-bold text-yellow-300">${hwT("ثيم الرقعة:", "Board theme:")}</span>
          ${hwThemeBtns}
          <span aria-hidden="true" class="w-px self-stretch bg-yellow-500/30"></span>
          <span class="font-bold text-yellow-300">${hwT("القطع:", "Pieces:")}</span>
          ${hwPieceBtns}
        </div>
        <div class="gold-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold ${stCls}">${status}</span>
          <div class="flex flex-wrap gap-2">
            <button onclick="hwShowSolution()" ${solvedAll ? "disabled" : ""} class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300 disabled:opacity-40">${hwT("الحل", "Solution")}</button>
            <button onclick="hwNext()" ${!solvedAll ? "disabled" : ""} class="tap rounded-xl text-xs gold-btn disabled:opacity-40">${HW.i + 1 >= ps.length ? hwT("خلاص ✓", "Done ✓") : hwT("التالي ←", "Next →")}</button>
          </div>
        </div>
      </div>
      <div class="min-w-0 lg:col-span-2 space-y-4">
        <div class="gold-card rounded-2xl p-5 space-y-3">
          <h2 class="font-display font-bold text-lg gold-gradient-text">${hwT("واجب:", "Homework:")} ${esc(title)}</h2>
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <span class="px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Step ${esc(String(HW.key).split("-")[0])}</span>
            <span class="px-2 py-0.5 rounded-lg bg-zinc-900 text-gray-300 border border-zinc-800">${hwT("لغز", "Puzzle")} ${HW.i + 1} ${hwT("من", "of")} ${ps.length}</span>
            <span class="px-2 py-0.5 rounded-lg bg-zinc-900 text-gray-300 border border-zinc-800">${hwT("محاولة رقم", "Attempt #")} ${attN}</span>
          </div>
          <div class="flex flex-wrap gap-1.5">${ps.map((_, j) => {
            const done = j < HW.i, cur = j === HW.i, ok = done && HW.firstTry[j];
            return `<span class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border ${cur ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-200" : ok ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" : done ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" : "bg-zinc-900 border-zinc-800 text-gray-500"}">${ok ? "✓" : j + 1}</span>`;
          }).join("")}</div>
          <p class="text-[11px] text-gray-400">${hwT("حل الموقف بنقلة واحدة صح — إجابتك من أول محاولة هي اللي بتتحسب. تقدر تعيد الواجب في أي وقت.", "Solve the position with one correct move — only your first-try answer counts. You can redo the homework anytime.")}</p>
          <div>${srcLink}</div>
        </div>
        ${u2 && u2.role === "student" && u2.hwp && u2.hwp[HW.key] ? `<div class="gold-card rounded-2xl p-4 text-center">
          <div class="text-lg font-extrabold text-emerald-300">${u2.hwp[HW.key].ft}/${u2.hwp[HW.key].t}</div>
          <div class="text-[11px] text-gray-400">${hwT("أفضل نتيجة مسجّلة — صح من أول محاولة", "Best recorded score — correct on the first try")}</div>
        </div>` : ""}
        <div class="lg:hidden">${hwBack}</div>
      </div>
    </div>`;
}
