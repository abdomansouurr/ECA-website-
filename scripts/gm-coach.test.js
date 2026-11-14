// Unit tests for the Grandmaster coach: the deep engine (analyzer.js), the concepts on the line (PositionConceptAnalyzer),
// the 10 move classes (GrandmasterMoveClassifier in gmcoach.js), the explanations, and the opening book (openings.js).
// Run: npm run test:gm
const fs = require("fs"), path = require("path"), vm = require("vm"), { pathToFileURL } = require("url");
const root = path.join(__dirname, "..");
(async () => {
  const { Chess } = await import(pathToFileURL(path.join(root, "vendor", "chess.js")).href);
  globalThis.ChessCls = Chess;
  for (const f of ["analyzer.js", "openings.js", "gmcoach.js"]) vm.runInThisContext(fs.readFileSync(path.join(root, "js", f), "utf8"), { filename: f });
  const A = globalThis.ChessPositionAnalyzer, P = globalThis.PositionConceptAnalyzer, G = globalThis.GrandmasterMoveClassifier, B = globalThis.EcaOpeningBook;
  let pass = 0, fail = 0;
  const T = (name, ok, info) => { ok ? pass++ : fail++; console.log((ok ? "✅ " : "❌ ") + name + (ok ? "" : "  → " + JSON.stringify(info))); };
  const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
  const deep = (fen, multi) => A.deepSearch(fen, { multiPV: multi || 2, maxNodes: 150000, budget: 5000 });
  // the whole review the app does: engine before + after the move, then classify and explain
  const rev = (fen, u, o) => { const post = new Chess(fen); post.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); return G.review(Object.assign({ preFen: fen, uci: u, pre: deep(fen, 3), post: deep(post.fen(), 1) }, o || {})); };

  // ---------- move generation + search ----------
  T("perft: start position depth 4 = 197281", A.perft("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 4) === 197281);
  T("perft: Kiwipete depth 3 = 97862 (castling, en passant, promotion)", A.perft("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", 3) === 97862);
  T("perft: promotions and checks position depth 3 = 62379", A.perft("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3) === 62379);
  { const r = deep("5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1");
    T("deep search: finds the smothered mate Qg8+ Rxg8 Nf7# (mate in 2) with its full line", r.lines[0].uci === "d5g8" && r.lines[0].mate === 2 && r.lines[0].pv.join(" ") === "d5g8 f8g8 h6f7", r.lines[0]); }
  { const r = deep("6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1");
    T("deep search: MultiPV gives the best move and the second best", r.lines.length === 2 && r.lines[0].uci === "d1d8" && r.lines[0].mate === 1 && r.lines[1].cp !== null, r.lines); }
  { const a = deep("r2q1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 9"), b = deep("r2q1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 9");
    T("deep search: same position, same answer every time (fixed node budget)", JSON.stringify(a.lines) === JSON.stringify(b.lines) && a.ms < 2500, { ms: a.ms }); }
  T("SEE: a knight taking a pawn defended by a pawn loses 220", A.see("4k3/8/3p4/4p3/8/5N2/8/4K3 w - - 0 1", "f3e5") === -220);
  // موقف غلط (ملك الأسود في كش والدور على الأبيض): chess.js بيقبله، والمحرك لازم مايكلش الملك ولا يقع
  { const bad = "2r3k1/8/8/8/2B5/8/P7/6K1 w - - 0 1", r = deep(bad, 1); let threw = "";
    try { rev(bad, "a2a3", { puzzle: true, isBest: false, hideBest: true }); } catch (e) { threw = e.message; }
    T("illegal position (king left in check): the engine never captures a king and the review doesn't crash", r && r.lines[0] && r.lines[0].uci !== "c4g8" && !threw, { first: r && r.lines[0] && r.lines[0].uci, threw }); }
  T("SEE: the queen sacrifice on g8 is negative", A.see("5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1", "d5g8") < -200);

  // ---------- Win% and the 10 classes (pure) ----------
  T("Win%: 0cp = 50%, +100cp ≈ 59.1%, −100cp ≈ 40.9%", Math.abs(G.winPct(0) - 50) < 1e-9 && Math.abs(G.winPct(100) - 59.1) < 0.1 && Math.abs(G.winPct(-100) - 40.9) < 0.1);
  const C = (o) => G.classify(Object.assign({ book: false, isBest: false, puzzle: false, sacrifice: false, second: null }, o)).tier;
  // الحدود بالظبط: أفضل ≤ 1%، ممتازة ≤ 3%، جيدة ≤ 6.5%، غير دقيقة ≤ 11.5%، خطأ ≤ 22%، وأكتر = خطأ فادح
  const cases = [
    ["BOOK", { book: true, best: { cp: 30 }, after: { cp: 30 } }],
    ["BRILLIANT", { isBest: true, sacrifice: true, best: { mate: 2 }, second: { cp: -300 }, after: { mate: 2 } }],
    ["GREAT", { isBest: true, best: { cp: 300 }, second: { cp: -50 }, after: { cp: 300 } }],
    ["BEST", { isBest: true, best: { cp: 50 }, second: { cp: 30 }, after: { cp: 50 } }],
    ["BEST", { best: { cp: 50 }, after: { cp: 40 } }],            // 0.9% (≤ 1%)
    ["EXCELLENT", { best: { cp: 50 }, after: { cp: 20 } }],       // 2.8%
    ["GOOD", { best: { cp: 50 }, after: { cp: -10 } }],           // 5.5%
    ["INACCURACY", { best: { cp: 50 }, after: { cp: -60 } }],     // 10.1%
    ["MISTAKE", { best: { cp: 50 }, after: { cp: -150 } }],       // 18.1%
    ["MISSED_WIN", { best: { mate: 1 }, after: { cp: 20 } }],
    ["BLUNDER", { best: { cp: 50 }, after: { cp: -400 } }]
  ];
  for (const [want, o] of cases) T(`class ${want} from the Win% loss`, C(o) === want, { got: C(o), o });
  T("class BLUNDER: walking into a forced mate", C({ best: { cp: 0 }, after: { mate: -2 } }) === "BLUNDER");
  T("class BLUNDER: a mistake-sized drop that loses a clear piece", C({ best: { cp: 100 }, after: { cp: -100 }, lossCp: -320 }) === "BLUNDER");
  T("class: a sacrifice that is not the best move is never brilliant", C({ sacrifice: true, best: { cp: 300 }, after: { cp: 100 } }) !== "BRILLIANT");
  T("class: in a puzzle, a wrong move that keeps the edge is at least an inaccuracy", C({ puzzle: true, isBest: false, best: { cp: 900 }, after: { cp: 880 } }) === "INACCURACY");
  // «عبقرية» محتاجة gap ≥ 12%، و«عظيمة» نادرة: gap ≥ 18% + قلبة/إنقاذ/فكرة هادية، ومش للأكل الروتيني ولا الانتشار ولا المات في نقلة
  T("calibration: a sacrifice when another move also mates (gap 0%) is BEST, not brilliant", C({ isBest: true, sacrifice: true, best: { mate: 2 }, second: { mate: 4 }, after: { mate: 2 } }) === "BEST");
  T("calibration: gap 15% (under 18%) is BEST, not great", C({ isBest: true, best: { cp: 120 }, second: { cp: -40 }, after: { cp: 120 } }) === "BEST");
  T("calibration: two moves win easily (+6 vs +4.5) is BEST, not great", C({ isBest: true, best: { cp: 600 }, second: { cp: 450 }, after: { cp: 600 } }) === "BEST");
  T("calibration: a routine capture (free piece) is BEST, not great", C({ isBest: true, best: { cp: 500 }, second: { cp: -20 }, after: { cp: 500 }, routine: true }) === "BEST");
  T("calibration: plain development is BEST, not great", C({ isBest: true, best: { cp: 200 }, second: { cp: -60 }, after: { cp: 200 }, development: true }) === "BEST");
  T("calibration: mate in one is BEST, not great", C({ isBest: true, best: { mate: 1 }, second: { cp: 0 }, after: { mate: 1 }, mateNow: true }) === "BEST");
  T("calibration: the only move that saves a lost game (rescue) is GREAT", C({ isBest: true, best: { cp: 10 }, second: { cp: -250 }, after: { cp: 10 } }) === "GREAT");
  T("calibration: a quiet only move (gap ≥ 18%) is GREAT", C({ isBest: true, best: { cp: 80 }, second: { cp: -140 }, after: { cp: 80 }, quiet: true }) === "GREAT");
  T("accuracy (Lichess formula): 0% loss ≈ 100, 10% loss ≈ 63.6, 50% loss ≈ 8", Math.abs(G.accuracy(0) - 100) < 0.01 && Math.abs(G.accuracy(10) - 63.6) < 0.2 && G.accuracy(50) > 7 && G.accuracy(50) < 9);
  T("badges and colors are Chess.com's", G.TIERS.BRILLIANT.sym === "!!" && G.TIERS.BRILLIANT.color === "#1BACA6" && G.TIERS.GREAT.color === "#5C8BB0" && G.TIERS.BEST.color === "#81B64C" && G.TIERS.EXCELLENT.color === "#96BC4B"
    && G.TIERS.GOOD.color === "#97AF8B" && G.TIERS.BOOK.color === "#A88865" && G.TIERS.INACCURACY.color === "#F7C631" && G.TIERS.MISTAKE.color === "#E68A00" && G.TIERS.MISSED_WIN.color === "#E69D00" && G.TIERS.BLUNDER.color === "#CA3431" && G.TIERS.BLUNDER.sym === "??");

  // ---------- the 10 classes on real positions (engine + explanation) ----------
  { const r = rev("3r3k/1n4pp/1q3p2/5P2/5r2/8/4Q1PP/4R2K w - - 0 39", "e2e8");
    T("real: Qe8+!! (queen sacrifice, the only way to win: back-rank mate) is BRILLIANT with its badge and Arabic title", r.tier === "BRILLIANT" && r.gap >= 12 && r.text.title.startsWith("!! نقلة عبقرية") && /تضحية/.test(strip(r.text.verdict)), { tier: r.tier, gap: r.gap, title: r.text.title });
    T("real: the brilliant move's line ends in the back-rank mate", /الصف الأخير/.test(strip(r.text.continuation)) && /#/.test(strip(r.text.continuation)), strip(r.text.continuation)); }
  { const r = rev("5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1", "d5g8");
    T("real: Qg8+ (smothered mate) — Nf7+ mates too, so the gap is 0%: BEST, not brilliant (strict rule)", r.tier === "BEST" && r.gap < 12, { tier: r.tier, gap: r.gap }); }
  { const r = rev("8/1KN5/1P6/2q3kp/8/8/8/8 w - - 0 55", "c7e6");
    T("real: Ne6+ (fork of king and queen, every other move loses) is GREAT", r.tier === "GREAT" && r.gap >= 18 && /شوكة مزدوجة/.test(strip(r.text.verdict)), { tier: r.tier, gap: r.gap, v: strip(r.text.verdict) }); }
  { const r = rev("8/8/5p2/4kP1K/8/8/8/8 w - - 5 56", "h5g6");
    T("real: Kg6 (the only winning king move in a pawn ending, a quiet move) is GREAT", r.tier === "GREAT" && r.gap >= 18, { tier: r.tier, gap: r.gap }); }
  { const r = rev("r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1", "b5c7");
    T("real: Nc7+ (the only move that saves the game, a fork) is GREAT", r.tier === "GREAT" && /شوكة مزدوجة/.test(strip(r.text.verdict)), { tier: r.tier, v: strip(r.text.verdict) }); }
  { const r = rev("4k3/8/8/8/3q4/8/8/3RK3 w - - 0 1", "d1d4");
    T("real: taking a free queen (routine capture) is BEST, never great", r.tier === "BEST", { tier: r.tier, gap: r.gap }); }
  // معايرة: أحسن نقلة للمحرك في مواقف عادية → أفضل/ممتازة، و«عظيمة» بس لو gap ≥ 18%
  { const fens = ["r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "r2q1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 9",
      "r1b2rk1/pp1nqppp/2p1pn2/3p4/2PP4/2NBPN2/PPQ2PPP/R3K2R w KQ - 0 10", "2kr3r/ppp2ppp/2n1b3/2b1p3/4P3/2N1BN2/PPP2PPP/R3KB1R w KQ - 0 10", "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5"];
    const got = fens.map(f => { const b = deep(f, 3).lines[0].uci, r = rev(f, b); return { tier: r.tier, gap: r.gap }; });
    T("calibration: the engine's best move in 5 ordinary positions is never GREAT without a ≥18% gap", got.every(x => ["BEST", "EXCELLENT", "GOOD"].includes(x.tier) || (x.tier === "GREAT" && x.gap >= 18)) && got.filter(x => x.tier === "GREAT").length <= 1, got); }
  { const r = rev("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2e4", { ply: 1 });
    T("real: 1.e4 is a BOOK move named «King's Pawn Opening» / «افتتاح بيدق الملك»", r.tier === "BOOK" && r.book.eco === "B00" && strip(r.text.verdict).includes("افتتاح بيدق الملك"), { tier: r.tier, book: r.book }); }
  { const r = rev("6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1", "h2h3");
    T("real: h3 instead of the back-rank mate Rd8# is a MISSED WIN (⚡) naming the mate", r.tier === "MISSED_WIN" && /كش مات في 1/.test(strip(r.text.verdict)) && r.bestUci === "d1d8", { tier: r.tier, v: strip(r.text.verdict) });
    T("real: the best-move layer shows Rd8# and calls it the back-rank weakness", /Rd8#/.test(strip(r.text.best)) && /الصف الأخير/.test(strip(r.text.best)), strip(r.text.best)); }
  { const r = rev("4k3/8/8/3p4/8/3Q4/8/4K3 w - - 0 1", "d3c4");
    T("real: Qc4?? dxc4 is a BLUNDER: the queen had no defender, the text says so", r.tier === "BLUNDER" && /من غير أي حماية/.test(strip(r.text.verdict)) && /c4/.test(strip(r.text.verdict)), { tier: r.tier, v: strip(r.text.verdict) }); }

  // ---------- self-consistency: recaptures and equal trades ----------
  { const r = rev("4k3/8/3p4/8/3P4/5N2/8/4K3 w - - 0 1", "f3e5");
    const v = strip(r.text.verdict);
    T("recapture: Ne5 (defended by the d4 pawn) is never «undefended» or «free»", !/من غير أي حماية|مجاناً|بدون حماية/.test(v) && /عليه حماية/.test(v) && r.refLine.firstLoss.capDefenders === 1, v);
    // بعد dxe5 الأخذ تاني بـ dxe5 مش بيكسب حاجة (الملك الأسود بياكل البيدق)، فالمحرك بيسيبه: الخسارة الحقيقية = الحصان
    T("recapture: the loss is the engine's real line after the captures (the knight), and it's a blunder", r.tier === "BLUNDER" && r.refLine.net <= -150 && /الحصان/.test(strip(r.text.continuation)), { tier: r.tier, net: r.refLine.net, c: strip(r.text.continuation) }); }
  { const r = rev("4k3/8/3p4/8/8/5N2/8/4K3 w - - 0 1", "f3e5");
    T("recapture: the same move with no defender IS called undefended", /من غير أي حماية/.test(strip(r.text.verdict)) && r.refLine.firstLoss.capDefenders === 0, strip(r.text.verdict)); }
  { const r = rev("4k3/8/4p3/3n4/8/2N5/8/4K3 w - - 0 1", "c3d5");
    const all = strip(r.text.verdict + r.text.continuation);
    T("equal trade: Nxd5 exd5 is not a sacrifice, not a blunder, never «free»", !r.sac.is && !["BLUNDER", "MISTAKE"].includes(r.tier) && !/مجاناً|من غير أي حماية/.test(all) && Math.abs(r.refLine.net) < 70, { tier: r.tier, all, net: r.refLine.net }); }
  { const L = P.verifyLine("4k3/8/3p4/8/3P4/5N2/8/4K3 w - - 0 1", ["f3e5", "d6e5", "d4e5"]);
    T("verify line: Nf3-e5 dxe5 dxe5 = knight for a pawn (−220) with the recapture seen", L.net === -220 && L.lossRecapturable === true, L); }

  // ---------- a 3-move tactic explained move by move ----------
  { const r = rev("8/8/4k3/q7/8/8/8/6KR b - - 0 1", "e6e5");
    const c = strip(r.text.continuation);
    T("deep: Ke5?? allows Rh5+ (skewer) and Rxa5 — a BLUNDER explained over 3 moves", r.tier === "BLUNDER" && /Rh5\+/.test(c) && /Rxa5/.test(c) && /سيخ/.test(c) && /الوزير/.test(c), { tier: r.tier, c }); }

  // ---------- the concepts on the line ----------
  const K = (fen, line) => P.walkLine(fen, line).steps.map(s => s.concepts.map(c => c.key));
  const has = (fen, line, ply, key) => (K(fen, line)[ply] || []).includes(key);
  const concepts = [
    ["fork", "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1", ["b5c7"], 0],
    ["pinAbs", "4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1", ["f1b5"], 0],
    ["pinRel", "3qk3/8/5n2/8/8/8/8/2B1K3 w - - 0 1", ["c1g5"], 0],
    ["skewer", "8/8/8/q3k3/8/8/8/6KR w - - 0 1", ["h1h5"], 0],
    ["discovered", "4k3/4q3/8/8/4N3/8/8/4R1K1 w - - 0 1", ["e4c5"], 0],
    ["discoveredCheck", "4k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1", ["e4c5"], 0],
    ["deflection", "4r1k1/3q1ppp/8/8/8/8/5PPP/4RBK1 w - - 0 1", ["f1b5", "d7d6", "e1e8"], 0],
    ["decoy", "5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1", ["d5g8", "f8g8", "h6f7"], 0],
    ["removalGuard", "4k3/p7/5n2/3b2B1/8/8/8/3RK3 w - - 0 1", ["g5f6", "a7a6", "d1d5"], 0],
    ["backRank", "6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1", ["d1d8"], 0],
    ["smothered", "5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1", ["d5g8", "f8g8", "h6f7"], 2],
    ["arabian", "7k/7p/5N2/8/8/8/8/6RK w - - 0 1", ["g1g8"], 0],
    ["anastasia", "5r2/4Nppk/8/8/8/8/8/6KR w - - 0 1", ["h1h3"], 0],
    ["zwischenzug", "4k3/8/8/3p4/2b5/2N5/8/R2QK3 w - - 0 1", ["c3d5", "c4d5", "a1a8", "e8e7", "d1d5"], 2],
    ["trapped", "4k3/8/8/8/8/1P6/b1P5/3RK3 w - - 0 1", ["d1a1"], 0],
    ["kingSafety", "4k3/8/8/8/8/8/5PPP/6K1 w - - 0 1", ["g2g4"], 0],
    ["openFile", "4k3/pp3ppp/8/8/8/8/PP3PPP/R3K3 w Q - 0 1", ["a1d1"], 0],
    ["passedPawn", "4k3/8/8/3P4/8/8/8/4K3 w - - 0 1", ["d5d6"], 0],
    ["outpost", "4k3/8/3p4/8/1NP5/8/8/4K3 w - - 0 1", ["b4d5"], 0],
    ["development", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", ["g1f3"], 0]
  ];
  for (const [key, fen, line, ply] of concepts) T(`concept on the board: ${key}`, has(fen, line, ply, key), K(fen, line));
  T("concept: a queen that just got sacrificed is not called a fork", !has("5r1k/6pp/7N/3Q4/8/8/8/6K1 w - - 0 1", ["d5g8"], 0, "fork"));

  // ---------- puzzles never show the solution ----------
  { const r = rev("6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1", "h2h3", { puzzle: true, hideBest: true, isBest: false });
    const t = strip(r.text.best);
    T("puzzle: the best-move layer gives the idea only — no move, no square", !/Rd8|d8|d1/.test(t) && /فكرتها/.test(t), t); }

  // ---------- the opening book ----------
  B.build(Chess);
  T("book: 120+ openings, every line legal", B.size() >= 120 && B.bad().length === 0, { size: B.size(), bad: B.bad() });
  { const g = new Chess(); ["d4", "e6", "c4", "Nf6", "Nc3", "Bb4"].forEach(m => g.move(m)); T("book: a transposition is found by position (1.d4 e6 2.c4 Nf6 3.Nc3 Bb4 = Nimzo-Indian)", (B.lookup(g.fen()) || {}).eco === "E20"); }
  { const g = new Chess(), fens = [g.fen()]; ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"].forEach(m => { g.move(m); fens.push(g.fen()); });
    const o = B.opening(fens); T("book: the game's opening name is the deepest one (Najdorf)", o && o.eco === "B90" && /نايدورف/.test(o.ar), o); }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
