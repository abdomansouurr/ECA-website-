// Unit tests for js/analyzer.js (ChessPositionAnalyzer): the punishing reply and the mistake reason, by type.
// Run: npm run test:coach
const fs = require("fs"), path = require("path"), vm = require("vm");
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "..", "js", "analyzer.js"), "utf8"));
const A = globalThis.ChessPositionAnalyzer;
let pass = 0, fail = 0;
const T = (name, okv, info) => { okv ? pass++ : fail++; console.log((okv ? "✅ " : "❌ ") + name + (okv ? "" : "  → " + JSON.stringify(info))); };

// [name, fen (student to move), wrong move, expected type, check(diag, ref)]
const CASES = [
  ["moved to a square a pawn guards", "4k3/8/3p4/8/8/5N2/8/4K3 w - - 0 1", "f3e5", "MOVED_TO_HANGING_SQUARE",
    (d, r) => r.from === "d6" && r.to === "e5" && d.studentPiece === "n" && d.opponentPiece === "p" && d.wrongTo === "e5"],
  ["the knight stops guarding the bishop", "4r1k1/8/8/8/4B3/2N5/8/6K1 w - - 0 1", "c3b5", "ABANDONED_DEFENSE",
    (d, r) => r.from === "e8" && r.to === "e4" && d.targetSq === "e4" && d.targetPiece === "b" && d.wrongFrom === "c3" && d.vectors.some(v => v.kind === "badge" && v.sq === "c3") && d.vectors.some(v => v.kind === "dots" && v.to === "e4")],
  ["the pawn stops guarding f3: knight fork on king and queen", "6k1/8/8/4n3/8/8/3Q2P1/6K1 w - - 0 1", "g2g3", "ALLOWED_OPPONENT_FORK",
    (d, r) => r.from === "e5" && r.to === "f3" && d.forkTargets.map(f => f.sq).sort().join() === "d2,g1" && d.vectors.filter(v => v.kind === "dash").length === 2],
  ["the rook leaves the back rank: mate in one", "4r1k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", "d1d7", "WALKED_INTO_MATE",
    (d, r) => r.from === "e8" && r.to === "e1" && r.mate && d.mateIn === 1 && d.kingSq === "g1"],
  ["a pawn move ignores the rook attacking the bishop", "2r3k1/8/8/8/2B5/8/P7/6K1 w - - 0 1", "a2a3", "IGNORED_EXISTING_THREAT",
    (d, r) => r.from === "c8" && r.to === "c4" && d.threatSq === "c4" && d.threatPiece === "b"],
  ["the king steps onto the file: skewer", "r5k1/8/8/8/3K4/8/4Q3/8 w - - 0 1", "d4e4", "ALLOWED_OPPONENT_PIN_OR_SKEWER",
    (d, r) => r.to === "e8" && d.pinnedSq === "e4" && d.behindSq === "e2" && d.vectors.some(v => v.kind === "xray")],
  ["the knight leaves the d-file: the rook sees the queen", "3r2k1/8/8/8/3N4/8/8/3Q2K1 w - - 0 1", "d4b5", "OPENED_LINE_OR_BROKEN_PIN",
    (d, r) => r.from === "d8" && r.to === "d1" && d.throughSq === "d4" && d.attackerSq === "d8"],
  ["a quiet move that loses nothing", "4k3/8/8/8/8/8/P7/4K3 w - - 0 1", "a2a3", "MISSED_TACTICAL_WIN",
    d => !d.refutation],
  ["an even trade is not a punishment", "4k3/8/5n2/8/8/8/6B1/4K3 w - - 0 1", "g2f3", "MISSED_TACTICAL_WIN", d => !d.refutation]
];
for (const [name, fen, wrong, type, check] of CASES) {
  const res = A.analyze(fen, wrong, "", []);
  const d = res && res.diag, r = res && res.rawRefutation;
  let good = false; try { good = !!d && d.type === type && check(d, r || {}); } catch (e) { good = false; }
  T(name + " → " + type, good, { type: d && d.type, ref: r && { from: r.from, to: r.to, gain: r.gain, mate: r.mate }, diag: d });
}
// a curated refutation in the puzzle wins over the search
{
  const r = A.findExactRefutation("4k3/8/3p4/8/8/5N2/8/4K3 w - - 0 1", "f3e5", { explicit: { f3e5: "e8e7" } });
  T("a curated refutation is used first", r && r.curated && r.from === "e8" && r.to === "e7", r);
}
// speed on busy middlegame positions, every legal wrong move
{
  const fens = ["r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "r2q1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 9",
    "r1b2rk1/pp1nqppp/2p1pn2/3p4/2PP4/2NBPN2/PPQ2PPP/R3K2R w KQ - 0 10", "2kr3r/ppp2ppp/2n1b3/2b1p3/4P3/2N1BN2/PPP2PPP/R3KB1R w KQ - 0 10"];
  let max = 0, n = 0;
  for (let i = 0; i < 20; i++) A.findExactRefutation(fens[0], "c4f7");   // warm-up: the first calls also pay for the JS compiler, which is not the search
  for (const fen of fens) {
    const pos = A.parse(fen);
    // all white moves via a quick legal list: reuse the engine through analyze on each from/to pair that parses
    for (const f of "abcdefgh") for (let r = 1; r <= 8; r++) for (const t of "abcdefgh") for (let s = 1; s <= 8; s++) {
      const u = f + r + t + s; if (f + r === t + s) continue;
      const t0 = Date.now(), ref = A.findExactRefutation(fen, u); if (!ref) continue;
      n++; max = Math.max(max, ref.ms);
    }
    void pos;
  }
  T("the punishing reply is found in under 30ms on busy positions (" + n + " wrong moves, worst " + max.toFixed(1) + "ms)", n > 50 && max < 30, { n, max });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
