// ECA — analyzer.js: محلل المواقف (ChessPositionAnalyzer)
// محرك تكتيكي صغير وسريع (لوح 0x88، alpha-beta بعمق 4 + quiescence للأكل والترقية) بيلاقي الرد اللي بيعاقب النقلة الغلط
// في أقل من 30ms، وبعدين بيقارن الموقف قبل وبعد النقلة عشان يعرف السبب بالظبط (8 أنواع) بالقطع والمربعات.
// مش بيعتمد على chess.js (اللي أبطأ بكتير للبحث)؛ النقلة اللي بيختارها بتتأكد بـ chess.js في coach.js قبل ما تتلعب.
// مفيش DOM هنا: نفس الملف بيتجرّب في Node (scripts/coach-analyzer.test.js).
(function (root) {
  const FILES = "abcdefgh";
  const TYPE = ["", "p", "n", "b", "r", "q", "k"], CODE = { p: 1, n: 2, b: 3, r: 4, q: 5, k: 6 };
  const VAL = [0, 100, 320, 330, 500, 900, 20000];
  const MATE = 100000;
  const KNIGHT = [-33, -31, -18, -14, 14, 18, 31, 33], KING = [-17, -16, -15, -1, 1, 15, 16, 17];
  const DIAG = [-17, -15, 15, 17], ORTH = [-16, -1, 1, 16], ALL = DIAG.concat(ORTH);
  const sqName = s => FILES[s & 7] + (8 - (s >> 4));
  const sqIdx = n => (8 - Number(n[1])) * 16 + FILES.indexOf(n[0]);
  const ok = s => !(s & 0x88);

  // ================= اللوح =================
  function parse(fen) {
    const [rows, side, , ep] = String(fen).split(" ");
    const b = new Int8Array(128), k = [-1, -1];
    let r = 0, c = 0, mat = 0;
    for (const ch of rows) {
      if (ch === "/") { r++; c = 0; continue; }
      if (ch >= "1" && ch <= "8") { c += Number(ch); continue; }
      const t = CODE[ch.toLowerCase()], col = ch === ch.toUpperCase() ? 0 : 8, s = r * 16 + c;
      if (!t || r > 7 || c > 7) throw new Error("bad fen");
      b[s] = t | col; if (t === 6) k[col ? 1 : 0] = s;
      if (t !== 6) mat += col ? -VAL[t] : VAL[t];
      c++;
    }
    if (k[0] < 0 || k[1] < 0) throw new Error("no king");
    return { b, turn: side === "b" ? 8 : 0, ep: ep && ep !== "-" ? sqIdx(ep) : -1, k, mat, st: [] };
  }
  const kingOf = (pos, col) => pos.k[col ? 1 : 0];
  // هل المربع ده متهاجم من اللون by (0 أبيض، 8 أسود)؟
  function attacked(pos, sq, by) {
    const b = pos.b, pawn = 1 | by;
    if (by === 0) { if (ok(sq + 15) && b[sq + 15] === pawn) return true; if (ok(sq + 17) && b[sq + 17] === pawn) return true; }
    else { if (ok(sq - 15) && b[sq - 15] === pawn) return true; if (ok(sq - 17) && b[sq - 17] === pawn) return true; }
    for (const d of KNIGHT) { const s = sq + d; if (ok(s) && b[s] === (2 | by)) return true; }
    for (const d of KING) { const s = sq + d; if (ok(s) && b[s] === (6 | by)) return true; }
    for (const d of DIAG) { let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (3 | by) || p === (5 | by)) return true; break; } s += d; } }
    for (const d of ORTH) { let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (4 | by) || p === (5 | by)) return true; break; } s += d; } }
    return false;
  }
  // كل القطع من اللون by اللي بتهاجم المربع (للتحليل، مش للبحث)
  function attackers(pos, sq, by) {
    const b = pos.b, out = [];
    for (const d of by === 0 ? [15, 17] : [-15, -17]) { const s = sq + d; if (ok(s) && b[s] === (1 | by)) out.push(s); }
    for (const d of KNIGHT) { const s = sq + d; if (ok(s) && b[s] === (2 | by)) out.push(s); }
    for (const d of KING) { const s = sq + d; if (ok(s) && b[s] === (6 | by)) out.push(s); }
    for (const d of DIAG) { let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (3 | by) || p === (5 | by)) out.push(s); break; } s += d; } }
    for (const d of ORTH) { let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (4 | by) || p === (5 | by)) out.push(s); break; } s += d; } }
    return out;
  }
  // النقلات (نقلة = from | to<<7 | ترقية<<14). caps = الأكل والترقية بس
  function gen(pos, out, caps) {
    const b = pos.b, me = pos.turn, them = me ^ 8;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq]; if (!p || (p & 8) !== me) continue;
      const t = p & 7;
      if (t === 1) {
        const dir = me ? 16 : -16, start = me ? 1 : 6, last = me ? 7 : 0, one = sq + dir;
        if (ok(one) && !b[one]) {
          if ((one >> 4) === last) out.push(sq | one << 7 | 5 << 14);
          else if (!caps) { out.push(sq | one << 7); const two = one + dir; if ((sq >> 4) === start && !b[two]) out.push(sq | two << 7); }
        }
        for (const d of [dir - 1, dir + 1]) {
          const to = sq + d; if (!ok(to)) continue;
          const q = b[to];
          if ((q && (q & 8) === them) || to === pos.ep) out.push(sq | to << 7 | ((to >> 4) === last ? 5 << 14 : 0));
        }
      } else if (t === 2 || t === 6) {
        for (const d of t === 2 ? KNIGHT : KING) { const to = sq + d; if (!ok(to)) continue; const q = b[to]; if (q ? (q & 8) === them : !caps) out.push(sq | to << 7); }
      } else {
        for (const d of t === 3 ? DIAG : t === 4 ? ORTH : ALL) {
          let to = sq + d;
          while (ok(to)) { const q = b[to]; if (q) { if ((q & 8) === them) out.push(sq | to << 7); break; } if (!caps) out.push(sq | to << 7); to += d; }
        }
      }
    }
    return out;
  }
  function make(pos, m) {
    const f = m & 127, t = (m >> 7) & 127, pr = (m >> 14) & 7, b = pos.b, p = b[f], me = pos.turn;
    let cap = b[t], capSq = t;
    if ((p & 7) === 1 && t === pos.ep && !cap) { capSq = t + (me ? -16 : 16); cap = b[capSq]; b[capSq] = 0; }
    pos.st.push(f, t, p, cap, capSq, pos.ep, pos.mat);
    const sign = me ? -1 : 1;
    if (cap) pos.mat += sign * VAL[cap & 7];
    if (pr) pos.mat += sign * (VAL[pr] - VAL[1]);
    b[t] = pr ? (pr | me) : p; b[f] = 0;
    if ((p & 7) === 6) pos.k[me ? 1 : 0] = t;
    pos.ep = (p & 7) === 1 && (t - f === 32 || f - t === 32) ? (f + t) >> 1 : -1;
    pos.turn ^= 8;
  }
  function unmake(pos) {
    const s = pos.st, mat = s.pop(), ep = s.pop(), capSq = s.pop(), cap = s.pop(), p = s.pop(), t = s.pop(), f = s.pop(), b = pos.b;
    pos.turn ^= 8;
    b[f] = p; b[t] = 0; b[capSq] = cap;
    if ((p & 7) === 6) pos.k[pos.turn ? 1 : 0] = f;
    pos.ep = ep; pos.mat = mat;
  }
  const inCheck = pos => attacked(pos, kingOf(pos, pos.turn), pos.turn ^ 8);
  function legal(pos, caps) {
    const all = gen(pos, [], caps), out = [], me = pos.turn;
    for (const m of all) { make(pos, m); if (!attacked(pos, kingOf(pos, me), me ^ 8)) out.push(m); unmake(pos); }
    return out;
  }
  // ترتيب: الأكل الأغلى بالقطعة الأرخص الأول، والترقية
  function order(pos, moves, first) {
    const b = pos.b, n = moves.length, sc = new Float64Array(n);
    for (let i = 0; i < n; i++) { const m = moves[i], v = b[(m >> 7) & 127]; sc[i] = m === first ? 1e9 : (v ? VAL[v & 7] * 10 - VAL[b[m & 127] & 7] / 100 : 0) + ((m >> 14) & 7 ? 8000 : 0); }
    for (let i = 1; i < n; i++) { const m = moves[i], s = sc[i]; let j = i - 1; while (j >= 0 && sc[j] < s) { moves[j + 1] = moves[j]; sc[j + 1] = sc[j]; j--; } moves[j + 1] = m; sc[j + 1] = s; }
    return moves;
  }
  const late = ctx => ++ctx.nodes > ctx.max || ((ctx.nodes & 255) === 0 && now() > ctx.deadline);
  const uci = m => sqName(m & 127) + sqName((m >> 7) & 127) + ((m >> 14) & 7 ? TYPE[(m >> 14) & 7] : "");
  // البحث من غير ما يعمل arrays جديدة في كل خطوة (عشان تنضيف الذاكرة ما يوقفهوش في النص): buffer لكل عمق
  const BUF = Array.from({ length: 48 }, () => new Int32Array(256)), SC = Array.from({ length: 48 }, () => new Float64Array(256));
  const PAWN_CAP = [[15, 17], [-17, -15]];
  function genInto(pos, out, caps) {
    const b = pos.b, me = pos.turn, them = me ^ 8;
    let n = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq]; if (!p || (p & 8) !== me) continue;
      const t = p & 7;
      if (t === 1) {
        const dir = me ? 16 : -16, start = me ? 1 : 6, last = me ? 7 : 0, one = sq + dir, pc = PAWN_CAP[me ? 0 : 1];
        if (ok(one) && !b[one]) {
          if ((one >> 4) === last) out[n++] = sq | one << 7 | 5 << 14;
          else if (!caps) { out[n++] = sq | one << 7; const two = one + dir; if ((sq >> 4) === start && !b[two]) out[n++] = sq | two << 7; }
        }
        for (let i = 0; i < 2; i++) {
          const to = sq + pc[i]; if (!ok(to)) continue;
          const q = b[to];
          if ((q && (q & 8) === them) || to === pos.ep) out[n++] = sq | to << 7 | ((to >> 4) === last ? 5 << 14 : 0);
        }
      } else if (t === 2 || t === 6) {
        const ds = t === 2 ? KNIGHT : KING;
        for (let i = 0; i < 8; i++) { const to = sq + ds[i]; if (!ok(to)) continue; const q = b[to]; if (q ? (q & 8) === them : !caps) out[n++] = sq | to << 7; }
      } else {
        const ds = t === 3 ? DIAG : t === 4 ? ORTH : ALL;
        for (let i = 0; i < ds.length; i++) {
          const d = ds[i]; let to = sq + d;
          while (ok(to)) { const q = b[to]; if (q) { if ((q & 8) === them) out[n++] = sq | to << 7; break; } if (!caps) out[n++] = sq | to << 7; to += d; }
        }
      }
    }
    return n;
  }
  function orderInto(pos, moves, n, first, sc) {
    const b = pos.b;
    for (let i = 0; i < n; i++) { const m = moves[i], v = b[(m >> 7) & 127]; sc[i] = m === first ? 1e9 : (v ? VAL[v & 7] * 10 - VAL[b[m & 127] & 7] / 100 : 0) + ((m >> 14) & 7 ? 8000 : 0); }
    for (let i = 1; i < n; i++) { const m = moves[i], s = sc[i]; let j = i - 1; while (j >= 0 && sc[j] < s) { moves[j + 1] = moves[j]; sc[j + 1] = sc[j]; j--; } moves[j + 1] = m; sc[j + 1] = s; }
  }

  // ================= البحث (alpha-beta + quiescence) =================
  function quiesce(pos, alpha, beta, ply, qd, ctx) {
    if (late(ctx)) { ctx.stop = true; return 0; }
    if (inCheck(pos)) return search(pos, 0, alpha, beta, ply, ctx);   // كش: لازم كل نقلات الهروب (عشان المات يتشاف)
    const stand = pos.turn ? -pos.mat : pos.mat;
    if (stand >= beta || qd > 6 || ply > 16) return stand;
    if (stand > alpha) alpha = stand;
    const buf = BUF[ply], n = genInto(pos, buf, true);
    orderInto(pos, buf, n, 0, SC[ply]);
    for (let i = 0; i < n; i++) {
      const m = buf[i], me = pos.turn;
      make(pos, m);
      if (attacked(pos, kingOf(pos, me), me ^ 8)) { unmake(pos); continue; }
      const sc = -quiesce(pos, -beta, -alpha, ply + 1, qd + 1, ctx);
      unmake(pos);
      if (ctx.stop) return 0;
      if (sc >= beta) return sc;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }
  function search(pos, depth, alpha, beta, ply, ctx) {
    if (late(ctx)) { ctx.stop = true; return 0; }
    const me = pos.turn, check = inCheck(pos);
    if (depth <= 0 && !check) return quiesce(pos, alpha, beta, ply, 0, ctx);
    if (ply > 16) return pos.turn ? -pos.mat : pos.mat;
    let best = -Infinity, n = 0;
    const buf = BUF[ply], cnt = genInto(pos, buf, false);
    orderInto(pos, buf, cnt, ply === 0 ? ctx.prev : 0, SC[ply]);
    for (let i = 0; i < cnt; i++) {
      const m = buf[i];
      make(pos, m);
      if (attacked(pos, kingOf(pos, me), me ^ 8)) { unmake(pos); continue; }
      n++;
      const sc = -search(pos, depth - 1, -beta, -alpha, ply + 1, ctx);
      unmake(pos);
      if (ctx.stop) return 0;
      if (sc > best) { best = sc; if (ply === 0) ctx.move = m; }
      if (sc > alpha) alpha = sc;
      if (alpha >= beta) break;
    }
    if (!n) return check ? -MATE + ply : 0;
    return best;
  }
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  // الرد العقابي على النقلة الغلط: البحث من ناحية الخصم في الموقف بعد الغلطة
  function findExactRefutation(preFen, wrong, opt) {
    const o = opt || {}, t0 = now();
    let pos;
    try { pos = parse(preFen); } catch (_) { return null; }
    const wm = legal(pos, false).find(m => uci(m) === wrong || uci(m) === wrong + "q");
    if (wm === undefined) return null;
    // الأساس = الخامات قبل الغلطة من ناحية الخصم، عشان التبديل المتساوي (أكلت وهو أكل) ما يتحسبش عقاب
    const base = pos.turn ? pos.mat : -pos.mat;
    make(pos, wm);
    if (!legal(pos, false).length) return null;   // النقلة الغلط نفسها أنهت الدور
    if (o.explicit && o.explicit[wrong]) {
      const m = legal(pos, false).find(x => uci(x) === o.explicit[wrong]);
      if (m !== undefined) return { from: sqName(m & 127), to: sqName((m >> 7) & 127), promotion: (m >> 14) & 7 ? TYPE[(m >> 14) & 7] : "", curated: true, score: 0, gain: 0, mate: false, mateIn: 0, depth: 0, nodes: 0, ms: now() - t0 };
    }
    // الحد الأساسي = عدد مواقف ثابت (نفس الموقف → نفس الرد ونفس الشرح كل مرة، مهما كان الجهاز مشغول)،
    // والوقت حد أمان بس (جهاز بطيء أو وقفة مفاجئة): بيرجّع آخر عمق خلص. 12000 موقف ≈ 10-16ms على لابتوب عادي
    const ctx = { nodes: 0, max: o.maxNodes || 12000, deadline: t0 + (o.budget || 25), stop: false, move: 0, prev: 0 };
    let bestMove = 0, bestScore = -Infinity, depth = 0;
    for (let d = 1; d <= (o.depth || 4); d++) {
      ctx.stop = false; ctx.move = 0;
      const sc = search(pos, d, -Infinity, Infinity, 0, ctx);
      if (ctx.stop) break;
      bestMove = ctx.move; bestScore = sc; depth = d; ctx.prev = bestMove;
      if (sc > MATE - 100) break;   // مات مضمون: مفيش داعي نكمّل
    }
    if (!bestMove) return null;
    const mate = bestScore > MATE - 100;
    return { from: sqName(bestMove & 127), to: sqName((bestMove >> 7) & 127), promotion: (bestMove >> 14) & 7 ? TYPE[(bestMove >> 14) & 7] : "",
      curated: false, score: bestScore, gain: mate ? Infinity : bestScore - base, mate, mateIn: mate ? Math.ceil((MATE - bestScore) / 2) : 0, depth, nodes: ctx.nodes, ms: now() - t0 };
  }

  // ================= هندسة الموقف =================
  function pieceAt(pos, sq) { const p = pos.b[sq]; return p ? { type: TYPE[p & 7], color: p & 8 ? "b" : "w", sq: sqName(sq) } : null; }
  // القطعة اللي على from بتهاجم target؟ (بدون ما تتحرك، مع مراعاة اللي بين الاتنين)
  function hits(pos, from, target) {
    const p = pos.b[from]; if (!p) return false;
    const t = p & 7, d = target - from;
    if (t === 1) return (p & 8) ? (d === 15 || d === 17) : (d === -15 || d === -17);
    if (t === 2) return KNIGHT.includes(d);
    if (t === 6) return KING.includes(d);
    const dirs = t === 3 ? DIAG : t === 4 ? ORTH : ALL;
    for (const dir of dirs) { let s = from + dir; while (ok(s)) { if (s === target) return true; if (pos.b[s]) break; s += dir; } }
    return false;
  }
  // اتجاه الخط بين مربعين (لو على نفس الصف/العمود/القطر)، وإلا 0
  function lineDir(a, b) {
    const df = (b & 7) - (a & 7), dr = (b >> 4) - (a >> 4);
    if (!df && !dr) return 0;
    if (df && dr && Math.abs(df) !== Math.abs(dr)) return 0;
    return Math.sign(dr) * 16 + Math.sign(df);
  }
  const between = (a, mid, b) => { const d = lineDir(a, b); if (!d || lineDir(a, mid) !== d) return false; for (let s = a + d; s !== b; s += d) if (s === mid) return true; return false; };
  const valOf = p => (p ? (p.type === "k" ? 1000 : VAL[CODE[p.type]] / 100) : 0);
  // قطع اللون col اللي القطعة على sq بتهاجمها (من غير الملك لو من نفس اللون)
  function targetsOf(pos, sq, col) {
    const out = [];
    for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } const p = pos.b[s]; if (p && ((p & 8) ? "b" : "w") === col && hits(pos, sq, s)) out.push(s); }
    return out;
  }
  const defended = (pos, s, col) => attackers(pos, s, col === "w" ? 0 : 8).length > 0;
  // أشعة X: قطعة الخصم الماشية (فيل/رخ/وزير) على sq بتبص على قطعة front ووراها على نفس الخط قطعة أغلى أو الملك
  function xray(pos, sq, col) {
    const p = pos.b[sq]; if (!p) return null;
    const t = p & 7; if (t < 3 || t > 5) return null;
    let found = null;
    for (const d of t === 3 ? DIAG : t === 4 ? ORTH : ALL) {
      let s = sq + d, front = -1;
      while (ok(s)) {
        const q = pos.b[s];
        if (q) {
          if (((q & 8) ? "b" : "w") !== col) break;
          if (front < 0) front = s;
          else {
            // ربط: اللي ورا أغلى (أو الملك). سيخ: اللي قدّام أغلى (أو الملك) واللي وراه قطعة لها قيمة
            const fv = VAL[pos.b[front] & 7], bv = VAL[q & 7];
            if (fv >= 300 && bv >= 300) found = { front, behind: s, pin: (q & 7) === 6 || (bv > fv && (pos.b[front] & 7) !== 6) };
            break;
          }
        }
        s += d;
      }
      if (found) break;
    }
    return found;
  }

  // ================= تشخيص سبب الغلطة (8 أنواع) =================
  function diagnoseMistakeReason(preFen, postFen, wrong, refutation, expected, themes) {
    let pre, post;
    try { pre = parse(preFen); post = parse(postFen); } catch (_) { return null; }
    const from = sqIdx(wrong.slice(0, 2)), to = sqIdx(wrong.slice(2, 4)), me = pre.turn ? "b" : "w", them = me === "w" ? "b" : "w";
    const moved = pieceAt(pre, from) || pieceAt(post, to);
    const out = { type: "MISSED_TACTICAL_WIN", studentPiece: moved && moved.type, wrongFrom: sqName(from), wrongTo: sqName(to), vectors: [], refutation: refutation || null, expected: expected || "", themes: themes || [] };
    if (!refutation) return out;
    const rf = sqIdx(refutation.from), rt = sqIdx(refutation.to), opp = pieceAt(post, rf), victim = pieceAt(post, rt);
    out.opponentPiece = opp && opp.type; out.refFrom = refutation.from; out.refTo = refutation.to;
    if (refutation.mate) {
      out.type = "WALKED_INTO_MATE"; out.mateIn = refutation.mateIn || 1;
      const ks = kingOf(post, me === "w" ? 0 : 8); out.kingSq = sqName(ks);
      out.vectors.push({ kind: "ring", sq: out.kingSq, tone: "red" });
      return out;
    }
    if (!(refutation.gain >= 90) && !refutation.curated) { out.refutation = null; return out; }   // مفيش عقاب حقيقي: النقلة بس فوّتت التكتيك
    // اللي حصل بعد الرد
    const after = parse(postFen), rmv = legal(after, false).find(m => uci(m) === refutation.from + refutation.to + (refutation.promotion || ""));
    if (rmv !== undefined) make(after, rmv);
    if (victim && victim.color === me) {
      out.targetSq = victim.sq; out.targetPiece = victim.type;
      if (rt === to) { out.type = "MOVED_TO_HANGING_SQUARE"; out.vectors.push({ kind: "ring", sq: victim.sq, tone: "red" }); return out; }
      if (pre.b[from] && hits(pre, from, rt) && !(attackers(post, rt, me === "w" ? 0 : 8).length)) {
        out.type = "ABANDONED_DEFENSE";
        out.vectors.push({ kind: "badge", sq: sqName(from), text: "🛡️❌" }, { kind: "dots", from: sqName(from), to: victim.sq }, { kind: "ring", sq: victim.sq, tone: "red" });
        return out;
      }
      if (opp && "brq".includes(opp.type) && between(rf, from, rt)) {
        out.type = "OPENED_LINE_OR_BROKEN_PIN"; out.attackerSq = refutation.from; out.throughSq = sqName(from);
        out.vectors.push({ kind: "xray", from: refutation.from, to: victim.sq }, { kind: "ring", sq: sqName(from), tone: "amber" });
        return out;
      }
    }
    // القطعة المأكولة كانت مهددة ومش محمية من قبل النقلة
    const wasThreat = victim && victim.color === me && attackers(pre, rt, pre.turn ^ 8).length > 0
      && (!attackers(pre, rt, pre.turn).length || attackers(pre, rt, pre.turn ^ 8).some(s => VAL[pre.b[s] & 7] < VAL[CODE[victim.type]]));
    // شوكة: القطعة اللي اتلعبت بتهاجم قطعتين غاليين أو أكتر (أو الملك + قطعة)
    const forks = targetsOf(after, rt, me).map(s => pieceAt(after, s)).filter(p => p && (p.type === "k" || VAL[CODE[p.type]] >= 300) && (p.type === "k" || !defended(after, sqIdx(p.sq), me) || VAL[CODE[p.type]] > VAL[CODE[(opp || {}).type || "p"]]))
      .sort((a, b) => valOf(b) - valOf(a));
    if (forks.length >= 2) {
      out.type = "ALLOWED_OPPONENT_FORK"; out.forkTargets = forks.slice(0, 2).map(p => ({ type: p.type, sq: p.sq }));
      out.forkTargets.forEach(f => out.vectors.push({ kind: "dash", from: refutation.to, to: f.sq }, { kind: "ring", sq: f.sq, tone: "amber" }));
      return out;
    }
    if (wasThreat) {
      out.type = "IGNORED_EXISTING_THREAT"; out.threatSq = victim.sq; out.threatPiece = victim.type;
      out.vectors.push({ kind: "ring", sq: victim.sq, tone: "red" });
      return out;
    }
    const xr = xray(after, rt, me);
    if (xr) {
      out.type = "ALLOWED_OPPONENT_PIN_OR_SKEWER"; out.pinnedSq = sqName(xr.front); out.behindSq = sqName(xr.behind);
      out.pinnedPiece = pieceAt(after, xr.front).type; out.behindPiece = pieceAt(after, xr.behind).type;
      out.vectors.push({ kind: "xray", from: refutation.to, to: out.behindSq }, { kind: "ring", sq: out.pinnedSq, tone: "amber" });
      return out;
    }
    // خط اتفتح لقطعة ماشية بسبب النقلة (مش أكل مباشر)
    if (opp && "brq".includes(opp.type) && victim && between(rf, from, rt)) {
      out.type = "OPENED_LINE_OR_BROKEN_PIN"; out.attackerSq = refutation.from; out.throughSq = sqName(from);
      out.vectors.push({ kind: "xray", from: refutation.from, to: refutation.to });
      return out;
    }
    // التهديد كان موجود من قبل النقلة والنقلة ما اتعاملتش معاه
    out.type = "IGNORED_EXISTING_THREAT";
    if (victim) { out.threatSq = victim.sq; out.threatPiece = victim.type; out.vectors.push({ kind: "ring", sq: victim.sq, tone: "red" }); }
    return out;
  }

  // ================= ملامح الموقف (للتلميح الأول وتفكير الكوتش) =================
  // اللاعب اللي عليه الدور = col. بنطلع: قطع الخصم السايبة، قطعتين للخصم على خط واحد، مربعات هروب ملك الخصم، والكشوش المتاحة
  function features(fen) {
    let pos; try { pos = parse(fen); } catch (_) { return null; }
    const col = pos.turn ? "b" : "w", opp = col === "w" ? "b" : "w", oppBy = opp === "w" ? 0 : 8, myBy = pos.turn;
    const out = { loose: [], aligned: null, kingSq: "", escapes: 0, checks: 0, captures: 0 };
    for (let s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      const p = pos.b[s]; if (!p || ((p & 8) ? "b" : "w") !== opp || (p & 7) === 6) continue;
      if (!attackers(pos, s, oppBy).length) out.loose.push({ type: TYPE[p & 7], sq: sqName(s), attacked: attacked(pos, s, myBy) });
    }
    out.loose.sort((a, b) => (b.attacked - a.attacked) || (VAL[CODE[b.type]] - VAL[CODE[a.type]]));
    // ملك أو وزير الخصم على نفس الخط مع قطعة تانية للخصم (ممكن ربط أو سيخ)
    const ks = kingOf(pos, oppBy); out.kingSq = sqName(ks);
    const big = []; for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } const p = pos.b[s]; if (p && ((p & 8) ? "b" : "w") === opp && ((p & 7) === 6 || (p & 7) === 5 || (p & 7) === 4)) big.push(s); }
    for (const a of big) for (const c of big) {
      if (a >= c || out.aligned) continue;
      const d = lineDir(a, c); if (!d) continue;
      let clear = true; for (let s = a + d; s !== c; s += d) if (pos.b[s]) { clear = false; break; }
      if (clear) out.aligned = { a: pieceAt(pos, a), b: pieceAt(pos, c) };
    }
    for (const d of KING) { const s = ks + d; if (!ok(s)) continue; const q = pos.b[s]; if ((!q || ((q & 8) ? "b" : "w") !== opp) && !attacked(pos, s, myBy)) out.escapes++; }
    for (const m of legal(pos, false)) {
      if (pos.b[(m >> 7) & 127]) out.captures++;
      make(pos, m); if (inCheck(pos)) out.checks++; unmake(pos);
    }
    return out;
  }

  // كل حاجة مع بعض: الرد + السبب
  function analyze(preFen, wrong, expected, themes, explicit) {
    const t0 = now(), ref = findExactRefutation(preFen, wrong, { explicit });
    if (!ref) return null;
    let post; try { post = parse(preFen); } catch (_) { return null; }
    const wm = legal(post, false).find(m => uci(m) === wrong || uci(m) === wrong + "q");
    make(post, wm);
    const postFen = toFen(post);
    const diag = diagnoseMistakeReason(preFen, postFen, wrong, ref, expected, themes);
    return { refutation: diag && diag.refutation ? ref : null, rawRefutation: ref, diag, postFen, ms: now() - t0 };
  }
  function toFen(pos) {
    let s = "";
    for (let r = 0; r < 8; r++) {
      let e = 0;
      for (let c = 0; c < 8; c++) { const p = pos.b[r * 16 + c]; if (!p) { e++; continue; } if (e) { s += e; e = 0; } const ch = TYPE[p & 7]; s += p & 8 ? ch : ch.toUpperCase(); }
      if (e) s += e; if (r < 7) s += "/";
    }
    return s + " " + (pos.turn ? "b" : "w") + " - " + (pos.ep >= 0 ? sqName(pos.ep) : "-") + " 0 1";
  }

  root.ChessPositionAnalyzer = { findExactRefutation, diagnoseMistakeReason, features, analyze, parse, toFen, VAL, MATE };
  // تسخين مرة واحدة والمتصفح فاضي: أول غلطة للطالب ما تدفعش تمن تجهيز الـ JS (وإلا أول رد ممكن ياخد 30ms+)
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const warm = () => { try { for (let i = 0; i < 3; i++) findExactRefutation("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "c4f7"); } catch (_) {} };
    if (window.requestIdleCallback) window.requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500);
  }
})(typeof window !== "undefined" ? window : globalThis);
