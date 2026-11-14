// Runs the real database.rules.json (Realtime Database) on the local emulator. Never touches production.
// Run with: npm run test:rules:emulator (it runs the Firestore rules first, then these).
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const firebase = require("firebase/compat/app"); require("firebase/compat/database");
const fs = require("fs"), path = require("path");
const RULES = fs.readFileSync(path.join(__dirname, "..", "database.rules.json"), "utf8");
const TS = firebase.database.ServerValue.TIMESTAMP;
const W = "whiteU1", B = "blackU1", X = "strangerU1", COACH = "coachU1", MID = "liveAAAAAAAAAAAAAAAA";

(async () => {
  const env = await initializeTestEnvironment({ projectId: "demo-eca", database: { rules: RULES, host: "127.0.0.1", port: 9000 } });
  let pass = 0, fail = 0; const failures = [];
  const as = uid => (uid ? env.authenticatedContext(uid, { firebase: { sign_in_provider: "password" } }) : env.unauthenticatedContext()).database();
  const seed = async (match, extra) => env.withSecurityRulesDisabled(async c => {
    const db = c.database(); await db.ref().set(null);
    if (match) await db.ref("liveMatches/" + MID).set(match);
    if (extra) for (const [p, v] of Object.entries(extra)) await db.ref(p).set(v);
  });
  const T = async (name, expect, who, fn, match, extra) => {
    await seed(typeof match === "function" ? match() : match, extra);
    let got = true, msg = "";
    try { await fn(as(who)); } catch (e) { got = false; msg = String(e.message).replace(/\s+/g, " ").slice(0, 200); }
    const ok = got === expect; ok ? pass++ : (fail++, failures.push(name + " :: " + msg));
    console.log(ok ? "OK  " : "FAIL", expect ? "allow" : "deny ", name);
  };
  const ref = db => db.ref("liveMatches/" + MID);
  const fresh = (x = {}) => Object.assign({ whiteUid: W, blackUid: B, baseMs: 180000, incrementMs: 2000, turn: "w", plyCount: 0, lastMoveUci: "", uciMoves: "", wTimeMs: 180000, bTimeMs: 180000,
    lastMoveAt: TS, status: "live", result: "", termination: "", pendingTermination: "", drawOfferedBy: "", illegalMoveAttempt: "" }, x);
  // a game after 1.e4 e5 with white to move; the last move was `ago` ms ago
  const midGame = (x = {}, ago = 5000) => () => Object.assign(fresh({ turn: "w", plyCount: 2, lastMoveUci: "e7e5", uciMoves: "e2e4 e7e5", wTimeMs: 100000, bTimeMs: 90000, lastMoveAt: Date.now() - ago }), x);
  const mv = (uci, x = {}) => db => ref(db).update(Object.assign({ plyCount: 3, turn: "b", lastMoveUci: uci, uciMoves: "e2e4 e7e5 " + uci, wTimeMs: 95500, lastMoveAt: TS, pendingTermination: "", drawOfferedBy: "" }, x));
  const end = x => db => ref(db).update(Object.assign({ status: "finished", pendingTermination: "", drawOfferedBy: "" }, x));

  // creating the relay node
  await T("create a game as white", true, W, db => ref(db).set(fresh()));
  await T("create a game as black", true, B, db => ref(db).set(fresh()));
  await T("create a game for two other students", false, X, db => ref(db).set(fresh()));
  await T("create a game with the opponent's clock cut", false, W, db => ref(db).set(fresh({ bTimeMs: 1000 })));
  await T("create a game against yourself", false, W, db => ref(db).set(fresh({ blackUid: W })));
  await T("create a game with an extra field", false, W, db => ref(db).set(fresh({ winner: W })));
  await T("read without signing in", false, null, db => ref(db).once("value"), midGame());
  await T("a classmate watches the game", true, X, db => ref(db).once("value"), midGame());
  // moves: turn lock, +1 ply, UCI format, appended history
  await T("white plays on white's turn", true, W, mv("g1f3"), midGame());
  await T("black plays on white's turn (turn lock)", false, B, mv("g8f6", { bTimeMs: 89000 }), midGame());
  await T("a spectator plays a move", false, X, mv("g1f3"), midGame());
  await T("a move that is not UCI", false, W, mv("Nf3"), midGame());
  await T("a move with an injected script", false, W, mv("<img>"), midGame());
  await T("two plies at once", false, W, db => ref(db).update({ plyCount: 4, turn: "w", lastMoveUci: "b8c6", uciMoves: "e2e4 e7e5 g1f3 b8c6", wTimeMs: 95500, lastMoveAt: TS }), midGame());
  await T("rewrite the move history", false, W, db => ref(db).update({ plyCount: 3, turn: "b", lastMoveUci: "g1f3", uciMoves: "d2d4 e7e5 g1f3", wTimeMs: 95500, lastMoveAt: TS }), midGame());
  await T("a move with a back-dated time", false, W, mv("g1f3", { lastMoveAt: Date.now() - 60000 }), midGame());
  // clocks: never above old - elapsed + increment + 350ms
  await T("honest clock after 5 seconds (+2s increment)", true, W, mv("g1f3", { wTimeMs: 96000 }), midGame());
  await T("clock above previous + increment + 350ms", false, W, mv("g1f3", { wTimeMs: 102500 }), midGame());
  await T("clock as if no time passed", false, W, mv("g1f3", { wTimeMs: 100000 }), midGame());
  await T("cut the opponent's clock", false, W, mv("g1f3", { bTimeMs: 1000 }), midGame());
  await T("the first move cannot add time", false, W, db => ref(db).update({ plyCount: 1, turn: "b", lastMoveUci: "e2e4", uciMoves: "e2e4", wTimeMs: 185000, lastMoveAt: TS }), fresh({ lastMoveAt: Date.now() - 1000 }));
  // the game cannot be ended by a claim alone
  await T("end the game with your own checkmate (fake checkmate)", false, W, mv("d1h5", { status: "finished", result: "1-0", termination: "checkmate" }), midGame());
  await T("finish as checkmate without any claim", false, W, end({ result: "1-0", termination: "checkmate" }), midGame());
  await T("a mating move carries a pending checkmate claim", true, W, mv("d1h5", { pendingTermination: "checkmate" }), midGame());
  const claimed = (p = "checkmate") => () => Object.assign(midGame()(), { turn: "b", plyCount: 3, lastMoveUci: "d1h5", uciMoves: "e2e4 e7e5 d1h5", wTimeMs: 96000, lastMoveAt: Date.now() - 300, pendingTermination: p });
  await T("the opponent confirms the checkmate (their own loss)", true, B, end({ result: "1-0", termination: "checkmate" }), claimed());
  await T("the claimer confirms his own checkmate", false, W, end({ result: "1-0", termination: "checkmate" }), claimed());
  await T("confirming a checkmate with the wrong winner", false, B, end({ result: "0-1", termination: "checkmate" }), claimed());
  await T("confirming a stalemate claim as a draw", true, B, end({ result: "1/2-1/2", termination: "stalemate" }), claimed("stalemate"));
  await T("moving on after a pending claim", false, B, db => ref(db).update({ plyCount: 4, turn: "w", lastMoveUci: "b8c6", uciMoves: "e2e4 e7e5 d1h5 b8c6", bTimeMs: 89000, lastMoveAt: TS }), claimed());
  await T("reject an illegal move: game void, the cheater flagged", true, B, end({ result: "", termination: "illegal", illegalMoveAttempt: "w" }), claimed());
  await T("flag your own move as illegal", false, W, end({ result: "", termination: "illegal", illegalMoveAttempt: "b" }), claimed());
  await T("a flag that hands you the win", false, B, end({ result: "0-1", termination: "illegal", illegalMoveAttempt: "w" }), claimed());
  // the honest endings
  await T("resign (your own loss)", true, W, end({ result: "0-1", termination: "resign" }), midGame());
  await T("resign but write a win", false, W, end({ result: "1-0", termination: "resign" }), midGame());
  await T("claim the win on time before the clock runs out", false, B, end({ result: "0-1", termination: "timeout" }), midGame({}, 5000));
  await T("claim the win when the opponent's clock ran out", true, B, end({ result: "0-1", termination: "timeout" }), midGame({ wTimeMs: 3000 }, 6000));
  await T("draw when the opponent offered", true, W, end({ result: "1/2-1/2", termination: "draw" }), midGame({ drawOfferedBy: "b" }));
  await T("accept your own draw offer", false, W, end({ result: "1/2-1/2", termination: "draw" }), midGame({ drawOfferedBy: "w" }));
  await T("offer a draw", true, W, db => ref(db).update({ drawOfferedBy: "w" }), midGame());
  await T("offer a draw in the opponent's name", false, W, db => ref(db).update({ drawOfferedBy: "b" }), midGame());
  await T("abort after both moved", false, W, end({ result: "", termination: "abort" }), midGame());
  await T("abort before the first moves", true, W, end({ result: "", termination: "abort" }), fresh({ lastMoveAt: Date.now() - 1000 }));
  // the ECA rating lives in Firestore only (verified human games): nothing in Realtime Database can hold or change it
  await T("rating: write an ECA rating anywhere at the root", false, W, db => db.ref("ratings/" + W).set({ ecaRating: 2400 }));
  await T("rating: write an ECA rating under users", false, W, db => db.ref("users/" + W + "/ecaRating").set(2400));
  await T("rating: hide a rating inside your presence", false, W, db => db.ref("presence/" + W).set({ online: true, at: TS, game: MID, ecaRating: 2400 }));
  await T("rating: hide a rating inside the live game relay", false, W, db => ref(db).update({ ecaRating: 2400 }), midGame());
  await T("rating: a player claims a result in the relay without a finished game", false, W, db => ref(db).update({ status: "finished", result: "1-0", termination: "checkmate" }), midGame());
  // presence and disconnects
  await T("write your own presence", true, W, db => db.ref("presence/" + W).set({ online: true, at: TS, game: MID }));
  await T("write a classmate's presence", false, W, db => db.ref("presence/" + B).set({ online: false, at: TS }));
  await T("back-date your presence", false, W, db => db.ref("presence/" + W).set({ online: false, at: Date.now() - 60000 }));
  await T("register an onDisconnect for your presence", true, W, db => db.ref("presence/" + W).onDisconnect().set({ online: false, at: TS, game: MID }));
  await T("claim the win when the opponent is gone for 30s", true, W, end({ result: "1-0", termination: "abandon" }), midGame(), { ["presence/" + B]: { online: false, at: Date.now() - 40000 } });
  await T("claim abandon while the opponent is online", false, W, end({ result: "1-0", termination: "abandon" }), midGame(), { ["presence/" + B]: { online: true, at: Date.now() - 40000 } });
  await T("claim abandon 10s after the opponent left", false, W, end({ result: "1-0", termination: "abandon" }), midGame(), { ["presence/" + B]: { online: false, at: Date.now() - 10000 } });
  // finished games
  await T("a move after the game ended", false, W, mv("g1f3"), midGame({ status: "finished", result: "0-1", termination: "resign" }));
  await T("rewrite a finished result", false, B, db => ref(db).update({ result: "0-1" }), midGame({ status: "finished", result: "1-0", termination: "resign" }));
  await T("a player clears a finished game", true, W, db => ref(db).remove(), midGame({ status: "finished", result: "0-1", termination: "resign" }));
  await T("a player deletes a live game", false, W, db => ref(db).remove(), midGame());
  await T("a coach (marked in /staff) closes a stuck game", true, COACH, end({ result: "", termination: "abort" }), midGame(), { ["staff/" + COACH]: true });
  await T("a coach writes a result", false, COACH, end({ result: "1-0", termination: "resign" }), midGame(), { ["staff/" + COACH]: true });
  await T("a student marks himself as staff", false, X, db => db.ref("staff/" + X).set(true));

  console.log(`\nRTDB rules: ${pass} passed, ${fail} failed`);
  if (failures.length) console.log("FAILURES:\n  " + failures.join("\n  "));
  await env.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("HARNESS", e); process.exit(1); });
