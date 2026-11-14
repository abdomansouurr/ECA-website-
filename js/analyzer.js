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
  // التبييت: علامة في النقلة (بت 17)، وحقوق التبييت 1=K 2=Q 4=k 8=q. أي حركة من/لـ مربعات الملك والرخ بتشيل الحق بتاعها
  const CASTLE = 1 << 17;
  const CR_MASK = new Uint8Array(128).fill(15);
  CR_MASK[116] = 12; CR_MASK[119] = 14; CR_MASK[112] = 13; CR_MASK[4] = 3; CR_MASK[7] = 11; CR_MASK[0] = 7;
  // مرحلة الدور (للملك: وسط اللعب ← النهاية): حصان/فيل 1، رخ 2، وزير 4 — 24 = كل القطع
  const PH = [0, 0, 1, 1, 2, 4, 0];
  // مفاتيح Zobrist (رقمين 32 بت) من مولّد ثابت: نفس الموقف = نفس المفتاح في الصفحة والـ Worker والاختبارات
  let zs = 0x2545F491;
  const zr = () => { zs ^= zs << 13; zs ^= zs >>> 17; zs ^= zs << 5; return zs | 0; };
  const ZL = new Int32Array(16 * 128), ZH = new Int32Array(16 * 128);
  for (let i = 0; i < ZL.length; i++) { ZL[i] = zr(); ZH[i] = zr(); }
  const ZSL = zr(), ZSH = zr(), ZCRL = new Int32Array(16), ZCRH = new Int32Array(16), ZEPL = new Int32Array(8), ZEPH = new Int32Array(8);
  for (let i = 0; i < 16; i++) { ZCRL[i] = zr(); ZCRH[i] = zr(); }
  for (let i = 0; i < 8; i++) { ZEPL[i] = zr(); ZEPH[i] = zr(); }
  // جداول مواقع القطع (Simplified Evaluation Function) من ناحية الأبيض، الصف 8 الأول
  const PST_SRC = [null,
    [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20]];
  const KMG = [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20];
  const KEG = [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50];
  // PSQ[قطعة*128+مربع]: موجب للأبيض وسالب للأسود (الملك بيتحسب لوحده حسب المرحلة)
  const PSQ = new Int16Array(16 * 128);
  for (let p = 1; p < 16; p++) {
    const t = p & 7; if (t < 1 || t > 5) continue;
    for (let s = 0; s < 128; s++) { if (s & 0x88) continue; const row = s >> 4, col = s & 7, v = PST_SRC[t][(p & 8 ? 7 - row : row) * 8 + col]; PSQ[p * 128 + s] = p & 8 ? -v : v; }
  }

  // ================= اللوح =================
  function parse(fen) {
    const [rows, side, cast, ep] = String(fen).split(" ");
    const b = new Int8Array(128), k = [-1, -1];
    let r = 0, c = 0, mat = 0, pst = 0, ph = 0;
    for (const ch of rows) {
      if (ch === "/") { r++; c = 0; continue; }
      if (ch >= "1" && ch <= "8") { c += Number(ch); continue; }
      const t = CODE[ch.toLowerCase()], col = ch === ch.toUpperCase() ? 0 : 8, s = r * 16 + c;
      if (!t || r > 7 || c > 7) throw new Error("bad fen");
      b[s] = t | col; if (t === 6) k[col ? 1 : 0] = s;
      if (t !== 6) { mat += col ? -VAL[t] : VAL[t]; pst += PSQ[(t | col) * 128 + s]; ph += PH[t]; }
      c++;
    }
    if (k[0] < 0 || k[1] < 0) throw new Error("no king");
    // حقوق التبييت: بس لو الملك والرخ في أماكنهم فعلاً
    let cr = 0; const cs = cast || "-";
    if (cs.includes("K") && b[116] === 6 && b[119] === 4) cr |= 1;
    if (cs.includes("Q") && b[116] === 6 && b[112] === 4) cr |= 2;
    if (cs.includes("k") && b[4] === 14 && b[7] === 12) cr |= 4;
    if (cs.includes("q") && b[4] === 14 && b[0] === 12) cr |= 8;
    const pos = { b, turn: side === "b" ? 8 : 0, ep: ep && ep !== "-" ? sqIdx(ep) : -1, k, mat, pst, ph, cr, hl: 0, hh: 0, st: [] };
    let hl = ZCRL[cr], hh = ZCRH[cr];
    for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } if (b[s]) { hl ^= ZL[b[s] * 128 + s]; hh ^= ZH[b[s] * 128 + s]; } }
    if (pos.turn) { hl ^= ZSL; hh ^= ZSH; }
    if (pos.ep >= 0) { hl ^= ZEPL[pos.ep & 7]; hh ^= ZEPH[pos.ep & 7]; }
    pos.hl = hl; pos.hh = hh;
    return pos;
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
  // التبييت (بيتضاف لأي مولّد نقلات): المربعات اللي في النص فاضية، والملك مش في كش ومش بيعدّي على مربع متهاجم
  function castles(pos, out, n) {
    const b = pos.b, cr = pos.cr;
    if (pos.turn === 0 && b[116] === 6) {
      if ((cr & 1) && !b[117] && !b[118] && b[119] === 4 && !attacked(pos, 116, 8) && !attacked(pos, 117, 8) && !attacked(pos, 118, 8)) out[n++] = 116 | 118 << 7 | CASTLE;
      if ((cr & 2) && !b[115] && !b[114] && !b[113] && b[112] === 4 && !attacked(pos, 116, 8) && !attacked(pos, 115, 8) && !attacked(pos, 114, 8)) out[n++] = 116 | 114 << 7 | CASTLE;
    } else if (pos.turn === 8 && b[4] === 14) {
      if ((cr & 4) && !b[5] && !b[6] && b[7] === 12 && !attacked(pos, 4, 0) && !attacked(pos, 5, 0) && !attacked(pos, 6, 0)) out[n++] = 4 | 6 << 7 | CASTLE;
      if ((cr & 8) && !b[3] && !b[2] && !b[1] && b[0] === 12 && !attacked(pos, 4, 0) && !attacked(pos, 3, 0) && !attacked(pos, 2, 0)) out[n++] = 4 | 2 << 7 | CASTLE;
    }
    return n;
  }
  // النقلات (نقلة = from | to<<7 | ترقية<<14 | تبييت<<17). caps = الأكل والترقية بس.
  // القايمة الكاملة دي فيها الترقية لأي قطعة (عشان أي نقلة جاية من Stockfish تتلاقى)؛ البحث بيرقّي لوزير بس.
  // أكل الملك مش نقلة أبداً: لو جالنا موقف غلط (ملك الطرف التاني في كش) المحرك بيكمّل عادي من غير ما «ياكل الملك»
  function gen(pos, out, caps) {
    const b = pos.b, me = pos.turn, them = me ^ 8;
    const promo = (f, to) => { out.push(f | to << 7 | 5 << 14); if (!caps) out.push(f | to << 7 | 2 << 14, f | to << 7 | 4 << 14, f | to << 7 | 3 << 14); };
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq]; if (!p || (p & 8) !== me) continue;
      const t = p & 7;
      if (t === 1) {
        const dir = me ? 16 : -16, start = me ? 1 : 6, last = me ? 7 : 0, one = sq + dir;
        if (ok(one) && !b[one]) {
          if ((one >> 4) === last) promo(sq, one);
          else if (!caps) { out.push(sq | one << 7); const two = one + dir; if ((sq >> 4) === start && !b[two]) out.push(sq | two << 7); }
        }
        for (const d of [dir - 1, dir + 1]) {
          const to = sq + d; if (!ok(to)) continue;
          const q = b[to];
          if ((q && (q & 8) === them && (q & 7) !== 6) || to === pos.ep) { if ((to >> 4) === last) promo(sq, to); else out.push(sq | to << 7); }
        }
      } else if (t === 2 || t === 6) {
        for (const d of t === 2 ? KNIGHT : KING) { const to = sq + d; if (!ok(to)) continue; const q = b[to]; if (q ? ((q & 8) === them && (q & 7) !== 6) : !caps) out.push(sq | to << 7); }
      } else {
        for (const d of t === 3 ? DIAG : t === 4 ? ORTH : ALL) {
          let to = sq + d;
          while (ok(to)) { const q = b[to]; if (q) { if ((q & 8) === them && (q & 7) !== 6) out.push(sq | to << 7); break; } if (!caps) out.push(sq | to << 7); to += d; }
        }
      }
    }
    if (!caps && pos.cr) { const tmp = []; const n = castles(pos, tmp, 0); for (let i = 0; i < n; i++) out.push(tmp[i]); }
    return out;
  }
  // النقلة على اللوح، والتقييم (خامات + مواقع) ومفتاح الموقف ومرحلة الدور بيتحدّثوا مع النقلة على طول
  function make(pos, m) {
    const f = m & 127, t = (m >> 7) & 127, pr = (m >> 14) & 7, b = pos.b, p = b[f], me = pos.turn;
    let cap = b[t], capSq = t;
    if ((p & 7) === 1 && t === pos.ep && !cap) { capSq = t + (me ? -16 : 16); cap = b[capSq]; b[capSq] = 0; }
    pos.st.push(m, p, cap, capSq, pos.ep, pos.mat, pos.cr, pos.pst, pos.ph, pos.hl, pos.hh);
    const sign = me ? -1 : 1, np = pr ? (pr | me) : p;
    let hl = pos.hl ^ ZL[p * 128 + f], hh = pos.hh ^ ZH[p * 128 + f], pst = pos.pst - PSQ[p * 128 + f];
    if (cap) { pos.mat += sign * VAL[cap & 7]; hl ^= ZL[cap * 128 + capSq]; hh ^= ZH[cap * 128 + capSq]; pst -= PSQ[cap * 128 + capSq]; pos.ph -= PH[cap & 7]; }
    if (pr) { pos.mat += sign * (VAL[pr] - VAL[1]); pos.ph += PH[pr]; }
    b[t] = np; b[f] = 0;
    hl ^= ZL[np * 128 + t]; hh ^= ZH[np * 128 + t]; pst += PSQ[np * 128 + t];
    if ((p & 7) === 6) {
      pos.k[me ? 1 : 0] = t;
      if (m & CASTLE) {
        const rf = t > f ? t + 1 : t - 2, rt = t > f ? t - 1 : t + 1, rk = 4 | me;
        b[rt] = rk; b[rf] = 0;
        hl ^= ZL[rk * 128 + rf] ^ ZL[rk * 128 + rt]; hh ^= ZH[rk * 128 + rf] ^ ZH[rk * 128 + rt]; pst += PSQ[rk * 128 + rt] - PSQ[rk * 128 + rf];
      }
    }
    if (pos.ep >= 0) { hl ^= ZEPL[pos.ep & 7]; hh ^= ZEPH[pos.ep & 7]; }
    pos.ep = (p & 7) === 1 && (t - f === 32 || f - t === 32) ? (f + t) >> 1 : -1;
    if (pos.ep >= 0) { hl ^= ZEPL[pos.ep & 7]; hh ^= ZEPH[pos.ep & 7]; }
    const cr = pos.cr & CR_MASK[f] & CR_MASK[t];
    if (cr !== pos.cr) { hl ^= ZCRL[pos.cr] ^ ZCRL[cr]; hh ^= ZCRH[pos.cr] ^ ZCRH[cr]; pos.cr = cr; }
    pos.turn ^= 8; pos.hl = hl ^ ZSL; pos.hh = hh ^ ZSH; pos.pst = pst;
  }
  function unmake(pos) {
    const s = pos.st, hh = s.pop(), hl = s.pop(), ph = s.pop(), pst = s.pop(), cr = s.pop(), mat = s.pop(), ep = s.pop(), capSq = s.pop(), cap = s.pop(), p = s.pop(), m = s.pop(), b = pos.b;
    const f = m & 127, t = (m >> 7) & 127;
    pos.turn ^= 8;
    b[f] = p; b[t] = 0; b[capSq] = cap;
    if ((p & 7) === 6) {
      pos.k[pos.turn ? 1 : 0] = f;
      if (m & CASTLE) { const rf = t > f ? t + 1 : t - 2, rt = t > f ? t - 1 : t + 1; b[rf] = b[rt]; b[rt] = 0; }
    }
    pos.ep = ep; pos.mat = mat; pos.cr = cr; pos.pst = pst; pos.ph = ph; pos.hl = hl; pos.hh = hh;
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
          if ((q && (q & 8) === them && (q & 7) !== 6) || to === pos.ep) out[n++] = sq | to << 7 | ((to >> 4) === last ? 5 << 14 : 0);
        }
      } else if (t === 2 || t === 6) {
        const ds = t === 2 ? KNIGHT : KING;
        for (let i = 0; i < 8; i++) { const to = sq + ds[i]; if (!ok(to)) continue; const q = b[to]; if (q ? ((q & 8) === them && (q & 7) !== 6) : !caps) out[n++] = sq | to << 7; }
      } else {
        const ds = t === 3 ? DIAG : t === 4 ? ORTH : ALL;
        for (let i = 0; i < ds.length; i++) {
          const d = ds[i]; let to = sq + d;
          while (ok(to)) { const q = b[to]; if (q) { if ((q & 8) === them && (q & 7) !== 6) out[n++] = sq | to << 7; break; } if (!caps) out[n++] = sq | to << 7; to += d; }
        }
      }
    }
    if (!caps && pos.cr) n = castles(pos, out, n);
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

  // ================= SEE: حساب سلسلة الأكل على مربع واحد =================
  // أرخص قطعة من اللون by بتهاجم المربع (من غير ما نعمل arrays)
  function leastAttacker(b, sq, by) {
    if (by === 0) { if (ok(sq + 15) && b[sq + 15] === 1) return sq + 15; if (ok(sq + 17) && b[sq + 17] === 1) return sq + 17; }
    else { if (ok(sq - 15) && b[sq - 15] === 9) return sq - 15; if (ok(sq - 17) && b[sq - 17] === 9) return sq - 17; }
    for (let i = 0; i < 8; i++) { const s = sq + KNIGHT[i]; if (ok(s) && b[s] === (2 | by)) return s; }
    let bs = -1, rs = -1, qs = -1;
    for (let i = 0; i < 4; i++) { const d = DIAG[i]; let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (3 | by)) { if (bs < 0) bs = s; } else if (p === (5 | by) && qs < 0) qs = s; break; } s += d; } }
    if (bs >= 0) return bs;
    for (let i = 0; i < 4; i++) { const d = ORTH[i]; let s = sq + d; while (ok(s)) { const p = b[s]; if (p) { if (p === (4 | by)) { if (rs < 0) rs = s; } else if (p === (5 | by) && qs < 0) qs = s; break; } s += d; } }
    if (rs >= 0) return rs;
    if (qs >= 0) return qs;
    for (let i = 0; i < 8; i++) { const s = sq + KING[i]; if (ok(s) && b[s] === (6 | by)) return s; }
    return -1;
  }
  const SEE_GAIN = new Int32Array(40), SEE_SAVE = new Int32Array(80);
  // مكسب اللي بيلعب النقلة m بعد ما كل الأكل على المربع يخلص (الطرفين بيختاروا يكملوا أو يقفوا). موجب = بيكسب
  function see(pos, m) {
    const b = pos.b, f = m & 127, t = (m >> 7) & 127, pr = (m >> 14) & 7, pf = b[f], pt = b[t];
    let side = pos.turn, d = 0, ns = 0, epSq = -1, epP = 0;
    const gain = SEE_GAIN;
    gain[0] = (pt ? VAL[pt & 7] : ((pf & 7) === 1 && t === pos.ep ? 100 : 0)) + (pr ? VAL[pr] - 100 : 0);
    let onSq = pr ? VAL[pr] : VAL[pf & 7];
    b[f] = 0; b[t] = pr ? (pr | side) : pf;
    if (!pt && (pf & 7) === 1 && t === pos.ep) { epSq = t + (side ? -16 : 16); epP = b[epSq]; b[epSq] = 0; }
    side ^= 8;
    for (;;) {
      const s = leastAttacker(b, t, side); if (s < 0) break;
      d++; gain[d] = onSq - gain[d - 1];
      if (Math.max(-gain[d - 1], gain[d]) < 0) break;
      onSq = VAL[b[s] & 7];
      SEE_SAVE[ns++] = s; SEE_SAVE[ns++] = b[s]; b[s] = 0;
      side ^= 8;
      if (d > 36) break;
    }
    while (d > 0) { gain[d - 1] = -Math.max(-gain[d - 1], gain[d]); d--; }
    while (ns > 0) { const p = SEE_SAVE[--ns], s = SEE_SAVE[--ns]; b[s] = p; }
    b[f] = pf; b[t] = pt; if (epSq >= 0) b[epSq] = epP;
    return gain[0];
  }

  // ================= البحث العميق (للتصنيف والشرح وخط التكملة) =================
  // PVS + جدول تبديل (Zobrist) + killers/history + null move + LMR + تمديد الكش + quiescence بقص SEE.
  // التقييم = خامات + مواقع القطع + الملك حسب المرحلة. الحد الأساسي عدد مواقف ثابت (نفس النتيجة كل مرة)، والوقت حد أمان بس.
  const MAXPLY = 64, TT_SIZE = 1 << 17, TT_MASK = TT_SIZE - 1;
  let TT = null;
  function ttClear() {
    if (!TT) TT = { lo: new Int32Array(TT_SIZE), hi: new Int32Array(TT_SIZE), mv: new Int32Array(TT_SIZE), sc: new Int32Array(TT_SIZE), dp: new Int8Array(TT_SIZE), fl: new Uint8Array(TT_SIZE) };
    else { TT.fl.fill(0); TT.lo.fill(0); TT.hi.fill(0); }
  }
  const DBUF = Array.from({ length: MAXPLY + 2 }, () => new Int32Array(256)), DSC = Array.from({ length: MAXPLY + 2 }, () => new Int32Array(256));
  const PVT = new Int32Array(MAXPLY * MAXPLY), PVL = new Int32Array(MAXPLY + 2);
  const KILL = new Int32Array((MAXPLY + 2) * 2), HIST = new Int32Array(16 * 128);
  function evaluate(pos) {
    const ph = pos.ph > 24 ? 24 : pos.ph, wk = pos.k[0], bk = pos.k[1];
    const wi = (wk >> 4) * 8 + (wk & 7), bi = (7 - (bk >> 4)) * 8 + (bk & 7);
    const s = pos.mat + pos.pst + (((KMG[wi] - KMG[bi]) * ph + (KEG[wi] - KEG[bi]) * (24 - ph)) / 24 | 0);
    return pos.turn ? -s : s;
  }
  function hasPieces(pos, col) { const b = pos.b; for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } const p = b[s]; if (p && (p & 8) === col && (p & 7) > 1 && (p & 7) < 6) return true; } return false; }
  function tick(ctx) { if (++ctx.nodes > ctx.max || ((ctx.nodes & 1023) === 0 && now() > ctx.deadline)) ctx.stop = true; return ctx.stop; }
  function scoreInto(pos, buf, n, sc, ttm, ply) {
    const b = pos.b;
    for (let i = 0; i < n; i++) {
      const m = buf[i], f = m & 127, t = (m >> 7) & 127, v = b[t], pr = (m >> 14) & 7;
      if (m === ttm) sc[i] = 2000000000;
      else if (v || pr || ((b[f] & 7) === 1 && t === pos.ep)) sc[i] = 100000000 + (v ? VAL[v & 7] : 100) * 16 - (VAL[b[f] & 7] >> 4) + (pr ? VAL[pr] : 0);
      else if (m === KILL[ply * 2]) sc[i] = 90000000;
      else if (m === KILL[ply * 2 + 1]) sc[i] = 80000000;
      else sc[i] = HIST[b[f] * 128 + t];
    }
  }
  function pickNext(buf, sc, i, n) {
    let bi = i; for (let j = i + 1; j < n; j++) if (sc[j] > sc[bi]) bi = j;
    if (bi !== i) { const m = buf[i], s = sc[i]; buf[i] = buf[bi]; sc[i] = sc[bi]; buf[bi] = m; sc[bi] = s; }
    return buf[i];
  }
  function dqs(pos, alpha, beta, ply, qd, ctx) {
    PVL[ply] = ply;
    if (tick(ctx)) return 0;
    if (ply >= MAXPLY - 2) return evaluate(pos);
    if (inCheck(pos)) return qd < 6 ? devade(pos, alpha, beta, ply, qd, ctx) : evaluate(pos);
    const stand = evaluate(pos);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const buf = DBUF[ply], sc = DSC[ply], n = genInto(pos, buf, true), me = pos.turn;
    scoreInto(pos, buf, n, sc, 0, ply);
    for (let i = 0; i < n; i++) {
      const m = pickNext(buf, sc, i, n), pr = (m >> 14) & 7;
      if (!pr) { const v = pos.b[(m >> 7) & 127]; if (stand + (v ? VAL[v & 7] : 100) + 200 < alpha) continue; if (see(pos, m) < 0) continue; }
      make(pos, m);
      if (attacked(pos, kingOf(pos, me), me ^ 8)) { unmake(pos); continue; }
      PVL[ply + 1] = ply + 1;
      const s = -dqs(pos, -beta, -alpha, ply + 1, qd + 1, ctx);
      unmake(pos);
      if (ctx.stop) return 0;
      if (s >= beta) return s;
      if (s > alpha) { alpha = s; PVT[ply * MAXPLY + ply] = m; for (let k = ply + 1; k < PVL[ply + 1]; k++) PVT[ply * MAXPLY + k] = PVT[(ply + 1) * MAXPLY + k]; PVL[ply] = PVL[ply + 1]; }
    }
    return alpha;
  }
  // في الكش جوه الـ quiescence: كل نقلات الهروب (عشان المات يتشاف)، والعمق محدود بـ qd
  function devade(pos, alpha, beta, ply, qd, ctx) {
    const buf = DBUF[ply], sc = DSC[ply], n = genInto(pos, buf, false), me = pos.turn;
    scoreInto(pos, buf, n, sc, 0, ply);
    let legalN = 0, best = -MATE - 1;
    for (let i = 0; i < n; i++) {
      const m = pickNext(buf, sc, i, n);
      make(pos, m);
      if (attacked(pos, kingOf(pos, me), me ^ 8)) { unmake(pos); continue; }
      legalN++; PVL[ply + 1] = ply + 1;
      const s = -dqs(pos, -beta, -alpha, ply + 1, qd + 1, ctx);
      unmake(pos);
      if (ctx.stop) return 0;
      if (s > best) best = s;
      if (s > alpha) { alpha = s; PVT[ply * MAXPLY + ply] = m; for (let k = ply + 1; k < PVL[ply + 1]; k++) PVT[ply * MAXPLY + k] = PVT[(ply + 1) * MAXPLY + k]; PVL[ply] = PVL[ply + 1]; }
      if (alpha >= beta) return alpha;
    }
    return legalN ? best : -MATE + ply;
  }
  function dsearch(pos, depth, alpha, beta, ply, ctx, pvNode, qd) {
    PVL[ply] = ply;
    if (tick(ctx)) return 0;
    const me = pos.turn, check = inCheck(pos);
    if (check && ply < ctx.ext) depth++;
    if (depth <= 0) return dqs(pos, alpha, beta, ply, 0, ctx);
    if (ply >= MAXPLY - 2) return evaluate(pos);
    if (ply > 0) { const ma = -MATE + ply, mb = MATE - ply - 1; if (alpha < ma) alpha = ma; if (beta > mb) beta = mb; if (alpha >= beta) return alpha; }
    const ti = pos.hl & TT_MASK; let ttm = 0;
    if (TT.fl[ti] && TT.lo[ti] === pos.hl && TT.hi[ti] === pos.hh) {
      ttm = TT.mv[ti];
      if (!pvNode && ply > 0 && TT.dp[ti] >= depth) {
        let s = TT.sc[ti]; if (s > MATE - 1000) s -= ply; else if (s < -MATE + 1000) s += ply;
        const fl = TT.fl[ti];
        if (fl === 1 || (fl === 2 && s >= beta) || (fl === 3 && s <= alpha)) return s;
      }
    }
    // null move: لو حتى من غير ما ألعب الموقف كويس كفاية، مفيش داعي أدوّر هنا (مش في الكش ولا في نهاية بيادق بس)
    if (!pvNode && !check && depth >= 3 && ply > 0 && beta < MATE - 1000 && hasPieces(pos, me) && evaluate(pos) >= beta) {
      const ep = pos.ep, ohl = pos.hl, ohh = pos.hh;
      let hl = ohl ^ ZSL, hh = ohh ^ ZSH; if (ep >= 0) { hl ^= ZEPL[ep & 7]; hh ^= ZEPH[ep & 7]; }
      pos.hl = hl; pos.hh = hh; pos.ep = -1; pos.turn ^= 8;
      const s = -dsearch(pos, depth - 3, -beta, -beta + 1, ply + 1, ctx, false, 0);
      pos.turn ^= 8; pos.ep = ep; pos.hl = ohl; pos.hh = ohh;
      if (ctx.stop) return 0;
      if (s >= beta) return beta;
      PVL[ply] = ply;
    }
    const buf = DBUF[ply], sc = DSC[ply], n = genInto(pos, buf, false), a0 = alpha;
    scoreInto(pos, buf, n, sc, ttm, ply);
    let best = -MATE - 1, bestMove = 0, legalN = 0;
    for (let i = 0; i < n; i++) {
      const m = pickNext(buf, sc, i, n);
      if (ply === 0 && ctx.excl.indexOf(m) >= 0) continue;
      const t = (m >> 7) & 127, quiet = !pos.b[t] && !((m >> 14) & 7) && !((pos.b[m & 127] & 7) === 1 && t === pos.ep);
      make(pos, m);
      if (attacked(pos, kingOf(pos, me), me ^ 8)) { unmake(pos); continue; }
      legalN++;
      PVL[ply + 1] = ply + 1;
      let s;
      if (legalN === 1) s = -dsearch(pos, depth - 1, -beta, -alpha, ply + 1, ctx, pvNode, 0);
      else {
        const r = depth >= 3 && quiet && !check && legalN > 4 && m !== KILL[ply * 2] && m !== KILL[ply * 2 + 1] && !inCheck(pos) ? (legalN > 12 ? 2 : 1) : 0;
        s = -dsearch(pos, depth - 1 - r, -alpha - 1, -alpha, ply + 1, ctx, false, 0);
        if (!ctx.stop && s > alpha && r) { PVL[ply + 1] = ply + 1; s = -dsearch(pos, depth - 1, -alpha - 1, -alpha, ply + 1, ctx, false, 0); }
        if (!ctx.stop && s > alpha && s < beta) { PVL[ply + 1] = ply + 1; s = -dsearch(pos, depth - 1, -beta, -alpha, ply + 1, ctx, true, 0); }
      }
      unmake(pos);
      if (ctx.stop) return 0;
      if (s > best) {
        best = s; bestMove = m;
        if (s > alpha) {
          alpha = s;
          PVT[ply * MAXPLY + ply] = m; for (let k = ply + 1; k < PVL[ply + 1]; k++) PVT[ply * MAXPLY + k] = PVT[(ply + 1) * MAXPLY + k]; PVL[ply] = PVL[ply + 1];
          if (alpha >= beta) {
            if (quiet) { if (KILL[ply * 2] !== m) { KILL[ply * 2 + 1] = KILL[ply * 2]; KILL[ply * 2] = m; } const hi = pos.b[m & 127] * 128 + t; HIST[hi] = Math.min(50000000, HIST[hi] + depth * depth); }
            break;
          }
        }
      }
    }
    if (!legalN) return check ? -MATE + ply : 0;
    const fl = best >= beta ? 2 : best > a0 ? 1 : 3;
    if (!TT.fl[ti] || TT.dp[ti] <= depth || fl === 1) {
      TT.lo[ti] = pos.hl; TT.hi[ti] = pos.hh; TT.mv[ti] = bestMove; TT.dp[ti] = depth; TT.fl[ti] = fl;
      TT.sc[ti] = best > MATE - 1000 ? best + ply : best < -MATE + 1000 ? best - ply : best;
    }
    return best;
  }
  // نتيجة البحث بالشكل اللي بيستخدمه Stockfish: cp أو mate من ناحية اللي عليه الدور + الخط (uci)
  function fmtScore(s) {
    if (s > MATE - 1000) return { cp: null, mate: Math.ceil((MATE - s) / 2) };
    if (s < -MATE + 1000) return { cp: null, mate: -Math.ceil((MATE + s) / 2) };
    return { cp: s, mate: null };
  }
  // deepSearch(fen, { multiPV, maxNodes, budget, depth }) → { lines: [{ uci, cp, mate, pv, depth }], depth, nodes, ms }
  function deepSearch(fen, opt) {
    const o = opt || {}, t0 = now();
    let pos; try { pos = parse(fen); } catch (_) { return null; }
    const moves = legal(pos, false);
    const out = { fen, lines: [], depth: 0, nodes: 0, ms: 0, src: "eca" };
    if (!moves.length) { out.over = inCheck(pos) ? "mate" : "stalemate"; out.ms = now() - t0; return out; }
    ttClear(); KILL.fill(0); HIST.fill(0);
    const multi = Math.max(1, Math.min(o.multiPV || 1, moves.length)), maxDepth = Math.min(o.depth || 30, MAXPLY - 8);
    const total = o.maxNodes || 150000, deadline = t0 + (o.budget || 2500), excl = [];
    for (let k = 0; k < multi; k++) {
      const ctx = { nodes: 0, max: k ? Math.floor(total * 0.6) : total, deadline, stop: false, excl: excl.slice(), ext: 8 };
      let line = null;
      for (let d = 1; d <= maxDepth; d++) {
        ctx.ext = d * 2 + 2;
        const s = dsearch(pos, d, -MATE - 1, MATE + 1, 0, ctx, true, 0);
        if (ctx.stop) break;
        const pv = []; for (let i = 0; i < PVL[0]; i++) pv.push(PVT[i]);
        if (!pv.length || (excl.length && excl.indexOf(pv[0]) >= 0)) break;
        line = { move: pv[0], score: s, depth: d, pv };
        if (Math.abs(s) > MATE - 1000 && d > MATE - Math.abs(s)) break;   // المات اتشاف لآخره
      }
      out.nodes += ctx.nodes;
      if (!line) break;
      excl.push(line.move);
      out.lines.push(Object.assign({ uci: uci(line.move), pv: line.pv.map(uci), depth: line.depth }, fmtScore(line.score)));
    }
    out.depth = out.lines.length ? out.lines[0].depth : 0;
    out.ms = now() - t0;
    return out;
  }
  // تقييم ثابت سريع للموقف (من ناحية الأبيض) بعد ما الأكل يهدى — لحساب «اتخسر إيه فعلاً» في آخر الخط
  function quietMaterial(fen) {
    let pos; try { pos = parse(fen); } catch (_) { return 0; }
    const ctx = { nodes: 0, max: 20000, deadline: now() + 40, stop: false, move: 0, prev: 0 };
    const s = quiesce(pos, -Infinity, Infinity, 0, 0, ctx);
    return ctx.stop ? pos.mat : (pos.turn ? -s : s);
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
      // كام قطعة لنا كانت حامية المربع (عشان الشرح مايقولش «من غير حماية» وهو محمي)
      if (rt === to) { out.type = "MOVED_TO_HANGING_SQUARE"; out.defenders = attackers(post, rt, me === "w" ? 0 : 8).length; out.vectors.push({ kind: "ring", sq: victim.sq, tone: "red" }); return out; }
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
    const cr = (pos.cr & 1 ? "K" : "") + (pos.cr & 2 ? "Q" : "") + (pos.cr & 4 ? "k" : "") + (pos.cr & 8 ? "q" : "");
    return s + " " + (pos.turn ? "b" : "w") + " " + (cr || "-") + " " + (pos.ep >= 0 ? sqName(pos.ep) : "-") + " 0 1";
  }

  // ================= PositionConceptAnalyzer: الأفكار على خط النقلات نفسه (مش تخمين) =================
  const colOf = p => (p & 8 ? "b" : "w");
  const clonePos = p => ({ b: Int8Array.from(p.b), turn: p.turn, ep: p.ep, k: p.k.slice(), mat: p.mat, pst: p.pst, ph: p.ph, cr: p.cr, hl: p.hl, hh: p.hh, st: [] });
  function findMove(pos, u) { const all = legal(pos, false); const m = all.find(x => uci(x) === u); return m !== undefined ? m : all.find(x => uci(x) === u + "q"); }
  const BIG = p => p && ((p & 7) === 6 || VAL[p & 7] >= 300);
  // قطع الخصم الغالية اللي القطعة على sq بتهاجمها (شوكة: 2 أو أكتر، كل واحدة يا ملك يا مش محمية يا أغلى من المهاجم)
  function forkTargets(pos, sq) {
    const p = pos.b[sq]; if (!p) return [];
    const them = (p & 8) ^ 8, out = [];
    for (let s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      const q = pos.b[s]; if (!q || (q & 8) !== them || !BIG(q) || !hits(pos, sq, s)) continue;
      if ((q & 7) === 6 || !attackers(pos, s, them).length || VAL[q & 7] > VAL[p & 7]) out.push({ type: TYPE[q & 7], sq: sqName(s) });
    }
    return out;
  }
  // قطعة ماشية لنا بقت بتشوف هدف غالي للخصم من خلال المربع اللي اتساب (هجوم/كش بالكشف)
  function discovered(pre, post, f, t) {
    const me = post.turn ^ 8, b = post.b;
    for (let s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      const p = b[s]; if (!p || (p & 8) !== me || s === t) continue;
      const k = p & 7; if (k < 3 || k > 5) continue;
      const d = lineDir(s, f); if (!d) continue;
      const diag = (d === 15 || d === 17 || d === -15 || d === -17);
      if ((k === 3 && !diag) || (k === 4 && diag)) continue;
      let x = s + d, clear = true; while (x !== f) { if (b[x]) { clear = false; break; } x += d; } if (!clear) continue;
      x = f + d; while (ok(x) && !b[x]) x += d;
      if (!ok(x) || x === t) continue;
      const q = b[x]; if (!q || (q & 8) === me || !BIG(q)) continue;
      if (!hits(pre, s, x)) return { by: TYPE[k], bySq: sqName(s), target: TYPE[q & 7], targetSq: sqName(x), check: (q & 7) === 6 };
    }
    return null;
  }
  function trappedBy(post, t) {
    // قطعة غالية للخصم (مش الملك) القطعة اللي اتحركت بتهاجمها، ومالهاش ولا مربع آمن تهرب له
    const me = post.turn ^ 8, them = post.turn, out = [];
    for (let s = 0; s < 128; s++) {
      if (s & 0x88) { s += 7; continue; }
      const q = post.b[s]; if (!q || (q & 8) !== them || (q & 7) === 6 || (q & 7) === 1 || !hits(post, t, s)) continue;
      // هل القطعة اللي اتحركت تكسبها فعلاً لو فضلت مكانها؟ (بنبص من ناحيتنا للحظة)
      post.turn ^= 8;
      const mc = legal(post, true).find(x => (x & 127) === t && ((x >> 7) & 127) === s), cap = mc === undefined ? -1 : see(post, mc);
      post.turn ^= 8;
      if (cap <= 0) continue;
      // مهرب = نقلة للقطعة دي ما بتخسرش (SEE ≥ 0)، أو قطعة تانية تاكل المهاجم من غير خسارة
      const moves = legal(post, false);
      const safe = moves.some(m => ((m & 127) === s && see(post, m) >= 0) || (((m >> 7) & 127) === t && see(post, m) >= 0));
      if (!safe) out.push({ type: TYPE[q & 7], sq: sqName(s) });
    }
    return out;
  }
  function isPassed(pos, sq) {
    const p = pos.b[sq]; if ((p & 7) !== 1) return false;
    const me = p & 8, f = sq & 7, r = sq >> 4, enemy = 1 | (me ^ 8);
    for (let rr = 0; rr < 8; rr++) {
      if (me ? rr <= r : rr >= r) continue;   // الصفوف اللي قدام البيدق بس
      for (let ff = f - 1; ff <= f + 1; ff++) if (ff >= 0 && ff < 8 && pos.b[rr * 16 + ff] === enemy) return false;
    }
    return true;
  }
  function fileOpen(pos, f, col) { let own = 0, opp = 0; for (let r = 0; r < 8; r++) { const p = pos.b[r * 16 + f]; if ((p & 7) === 1) { if (colOf(p) === col) own++; else opp++; } } return own ? "" : opp ? "semi" : "open"; }
  function outpost(pos, sq) {
    const p = pos.b[sq]; if ((p & 7) !== 2) return false;
    const me = p & 8, r = sq >> 4, f = sq & 7, rank = 8 - r;
    if (me ? rank < 3 || rank > 5 : rank < 4 || rank > 6) return false;
    if (!attackers(pos, sq, me).some(s => (pos.b[s] & 7) === 1)) return false;
    const enemy = 1 | (me ^ 8);
    for (let rr = 0; rr < 8; rr++) {
      if (me ? rr <= r : rr >= r) continue;
      for (const ff of [f - 1, f + 1]) if (ff >= 0 && ff < 8 && pos.b[rr * 16 + ff] === enemy) return false;
    }
    return true;
  }
  // نوع المات: الصف الأخير، الخنق (Smothered)، العربي، أناستازيا
  function matePattern(post, me) {
    const them = me ^ 8, ks = kingOf(post, them), kr = ks >> 4, kf = ks & 7, back = them ? 0 : 7;
    const checkers = attackers(post, ks, me), c = checkers[0], ct = c !== undefined ? post.b[c] & 7 : 0;
    const around = KING.map(d => ks + d).filter(ok);
    if (ct === 2 && around.every(s => post.b[s] && (post.b[s] & 8) === them)) return "smothered";
    if (ct === 4 && (kr === 0 || kr === 7) && (kf === 0 || kf === 7) && Math.abs((c >> 4) - kr) + Math.abs((c & 7) - kf) === 1 && attackers(post, c, me).some(s => (post.b[s] & 7) === 2)) return "arabian";
    if ((ct === 4 || ct === 5) && kr === back && (c >> 4) === kr) return "backRank";
    if ((ct === 4 || ct === 5) && (kf === 0 || kf === 7) && (c & 7) === kf && around.some(s => attackers(post, s, me).some(a => (post.b[a] & 7) === 2))) return "anastasia";
    return "";
  }
  // نمشي على الخط نقلة نقلة ونسجّل اللي حصل فعلاً على الرقعة + الأفكار في كل نقلة
  function walkLine(fen, line, max) {
    let pos; try { pos = parse(fen); } catch (_) { return { steps: [], ok: false }; }
    const fm0 = Number(String(fen).split(" ")[5]) || 1, side0 = pos.turn, steps = [], pres = [];
    for (let i = 0; i < (line || []).length && i < (max || 12); i++) {
      const m = findMove(pos, line[i]); if (m === undefined) break;
      const f = m & 127, t = (m >> 7) & 127, p = pos.b[f], me = pos.turn, col = me ? "b" : "w";
      let capSq = t, cap = pos.b[t];
      if (!cap && (p & 7) === 1 && t === pos.ep) { capSq = t + (me ? -16 : 16); cap = pos.b[capSq]; }
      const pre = clonePos(pos); pres.push(pre);
      const st = { i, uci: uci(m), color: col, piece: TYPE[p & 7], from: sqName(f), to: sqName(t), captured: cap ? TYPE[cap & 7] : "", capSq: cap ? sqName(capSq) : "",
        promo: (m >> 14) & 7 ? TYPE[(m >> 14) & 7] : "", castle: !!(m & CASTLE), moveNo: fm0 + ((i + (side0 ? 1 : 0)) >> 1), concepts: [] };
      st.capDefenders = cap ? attackers(pos, capSq, me ^ 8).length : 0;   // كام قطعة كانت حامية القطعة اللي اتاكلت
      st.see = see(pos, m);
      make(pos, m);
      const replies = legal(pos, false);
      st.check = inCheck(pos); st.mate = st.check && !replies.length; st.stalemate = !st.check && !replies.length;
      st.mat = pos.mat; st.fen = toFen(pos);
      st.recapture = cap ? attackers(pos, t, me ^ 8).length > 0 : false;
      st.hanging = !attackers(pos, t, me).length && attackers(pos, t, me ^ 8).length > 0;   // القطعة اللي اتحركت بقت متهاجمة ومش محمية
      const C = st.concepts, push = (key, o) => C.push(Object.assign({ key, ply: i }, o || {}));
      // الشوكة بتتحسب بس لو القطعة اللي عاملاها مش بتضيع على مربعها (وإلا دي تضحية مش شوكة)
      const ft = st.see >= 0 ? forkTargets(pos, t) : []; if (ft.length >= 2) push("fork", { sq: st.to, piece: st.piece, targets: ft.slice(0, 3) });
      const k = p & 7;
      let pinned = false;
      if (k >= 3 && k <= 5 && st.see >= 0) {
        const xr = xray(pos, t, col === "w" ? "b" : "w");
        if (xr) { const front = pos.b[xr.front], behind = pos.b[xr.behind]; pinned = true;
          push((behind & 7) === 6 ? "pinAbs" : xr.pin ? "pinRel" : "skewer", { sq: st.to, piece: st.piece, front: { type: TYPE[front & 7], sq: sqName(xr.front) }, behind: { type: TYPE[behind & 7], sq: sqName(xr.behind) } }); }
      }
      const disc = discovered(pre, pos, f, t); if (disc) push(disc.check ? "discoveredCheck" : "discovered", disc);
      if (st.mate) { const mp = matePattern(pos, me); if (mp) push(mp, { king: sqName(kingOf(pos, me ^ 8)) }); }
      if (!st.mate && !st.check && !pinned && st.see >= 0) { const tr = trappedBy(pos, t); if (tr.length) push("trapped", { target: tr[0] }); }
      if (k === 1 && isPassed(pos, t) && !st.promo) push("passedPawn", { sq: st.to });
      if (k === 2 && outpost(pos, t)) push("outpost", { sq: st.to });
      if (k === 4 && (f & 7) !== (t & 7)) { const fo = fileOpen(pos, t & 7, col); if (fo) push("openFile", { file: FILES[t & 7], open: fo }); }
      if (st.moveNo <= 12 && (st.castle || ((k === 2 || k === 3) && (f >> 4) === (me ? 0 : 7)) || (k === 1 && [51, 52, 67, 68].includes(t)))) push("development", { sq: st.to, castle: st.castle });
      // حماية الملك: بيدق من درع ملكنا المبيّت اتحرك، أو أكلنا قطعة جنب ملك الخصم
      const myK = kingOf(pre, me), kf = myK & 7, homeRow = me ? 0 : 7;
      if (k === 1 && (myK >> 4) === homeRow && (kf >= 5 || kf <= 2) && Math.abs((f & 7) - kf) <= 1 && (f >> 4) === homeRow + (me ? 1 : -1)) push("kingSafety", { own: true, sq: st.from });
      if (cap && KING.some(d => capSq + d === kingOf(pos, me ^ 8))) push("kingSafety", { own: false, sq: st.capSq });
      steps.push(st);
      if (st.mate || st.stalemate) break;
    }
    // أفكار بتتشاف على أكتر من نقلة: تشتيت، استدراج، إزالة المدافع، النقلة البينية
    for (let i = 0; i + 2 < steps.length; i++) {
      const a = steps[i], b = steps[i + 1], c = steps[i + 2], preB = pres[i + 1], preA = pres[i];
      const cTarget = c.capSq || (c.mate ? sqName(kingOf(parse(c.fen), c.color === "w" ? 8 : 0)) : "");
      if (cTarget && b.from !== cTarget) {
        const dIdx = sqIdx(b.from), x = sqIdx(cTarget);
        if (preB.b[dIdx] && hits(preB, dIdx, x) && sqIdx(b.to) !== x) a.concepts.push({ key: "deflection", ply: i, defender: { type: b.piece, sq: b.from }, target: cTarget });
      }
      // استدراج: ضحّينا بقطعة على مربع، والخصم أكلها فقطعته اتشدّت للمربع ده، وبعدها كش أو مات أو هجوم عليها
      if ((a.see < 0 || a.hanging) && b.to === a.to && b.captured) {
        const post = parse(c.fen); if (c.check || c.mate || hits(post, sqIdx(c.to), sqIdx(a.to))) a.concepts.push({ key: "decoy", ply: i, piece: b.piece, sq: a.to });
      }
      if (a.captured && c.capSq && c.capSq !== a.to) {
        const g = sqIdx(a.capSq), x = sqIdx(c.capSq);
        if (preA.b[g] && hits(preA, g, x) && (preA.b[x] & 8) === (preA.b[g] & 8)) a.concepts.push({ key: "removalGuard", ply: i, guard: { type: a.captured, sq: a.capSq }, target: c.capSq });
      }
      if (i > 0) {
        const prev = steps[i - 1];
        if (prev.captured && prev.color !== a.color && a.to !== prev.to && (a.check || a.captured) && c.to === prev.to && c.captured
          && attackers(preA, sqIdx(prev.to), preA.turn).length) a.concepts.push({ key: "zwischenzug", ply: i, sq: prev.to });
      }
    }
    return { steps, ok: true, pos };
  }
  // الحساب الحقيقي للخامات على الخط (بعد كل الأكل والأكل المضاد) من ناحية أول واحد لعب
  function verifyLine(fen, line, max) {
    const w = walkLine(fen, line, max), s = w.steps;
    if (!s.length) return { steps: [], net: 0, netRaw: 0, mate: "", firstLoss: null };
    const sign = s[0].color === "w" ? 1 : -1, start = parse(fen).mat, last = s[s.length - 1];
    const end = last.mate || last.stalemate ? last.mat : quietMaterial(last.fen);
    const firstLoss = s.find(x => x.color !== s[0].color && x.captured) || null;
    return { steps: s, net: sign * (end - start), netRaw: sign * (last.mat - start), mate: last.mate ? last.color : "", firstLoss,
      lossRecapturable: firstLoss ? s.some(x => x.i > firstLoss.i && x.color === s[0].color && x.to === firstLoss.to && x.captured) || firstLoss.capDefenders > 0 : false };
  }
  // النقلة تضحية؟ (1) القطعة اللي اتلعبت راحت مربع الخصم مسيطر عليه، وقيمتها أكبر من اللي أكلته، والخصم يكسبها فعلاً (SEE ≤ −200)
  // أو (2) النقلة سابت قطعة تانية (حصان أو أكبر) تتاكل بمكسب للخصم
  function sacrifice(fen, u) {
    let pos; try { pos = parse(fen); } catch (_) { return { is: false }; }
    const m = findMove(pos, u); if (m === undefined) return { is: false };
    const own = see(pos, m), mf = m & 127, mt = (m >> 7) & 127, movedV = VAL[pos.b[mf] & 7], capV = pos.b[mt] ? VAL[pos.b[mt] & 7] : 0;
    const capture = !!pos.b[mt] || ((pos.b[mf] & 7) === 1 && mt === pos.ep);
    make(pos, m);
    const replies = legal(pos, false), enemyHere = attackers(pos, mt, pos.turn).length > 0;
    if (!replies.length) { unmake(pos); return { is: false, see: own, risk: 0, capture, mate: inCheck(pos) }; }   // مات أو تعادل على طول: مش تضحية
    // الأكل على نفس المربع محسوب في SEE النقلة نفسها؛ هنا بنشوف القطع التانية اللي اتسابت
    let risk = 0, sq = "";
    const t = (m >> 7) & 127;
    for (const c of replies) { const ct = (c >> 7) & 127; if (ct === t || !pos.b[ct]) continue; const v = see(pos, c); if (v > risk) { risk = v; sq = sqName(ct); } }
    if (own < 0 && -own > risk) sq = sqName(t);
    const check = inCheck(pos);
    unmake(pos);
    const staticSac = enemyHere && movedV > capV && own <= -200 && (pos.b[mf] & 7) !== 6;
    const is = staticSac || risk - Math.max(0, own) >= 200;
    // «أكل روتيني»: الأكل بيكسب خامات على طول أو تبادل عادي (مش فكرة مخفية)
    return { is, see: own, risk, sq, capture, check, routineCapture: capture && own >= 0 };
  }

  // عدّ المواقف لعمق معيّن (اختبار صحة مولّد النقلات: تبييت، أخذ في المرور، ترقية)
  function perft(fen, depth) {
    const pos = parse(fen);
    const go = d => { if (!d) return 1; let n = 0; for (const m of legal(pos, false)) { make(pos, m); n += go(d - 1); unmake(pos); } return n; };
    return go(depth);
  }
  // SEE لنقلة uci من موقف FEN
  function seeUci(fen, u) { let pos; try { pos = parse(fen); } catch (_) { return 0; } const m = legal(pos, false).find(x => uci(x) === u); return m === undefined ? 0 : see(pos, m); }

  root.ChessPositionAnalyzer = { findExactRefutation, diagnoseMistakeReason, features, analyze, parse, toFen, VAL, MATE, deepSearch, see: seeUci, quietMaterial, perft };
  root.PositionConceptAnalyzer = { walkLine, verifyLine, sacrifice, concepts: (fen, line, max) => walkLine(fen, line, max).steps.map(s => s.concepts) };
  // جوه Web Worker (من غير DOM): البحث العميق بيشتغل هنا عشان الصفحة ما تقفش
  if (typeof window === "undefined" && typeof importScripts === "function" && typeof postMessage === "function") {
    root.onmessage = e => {
      const d = e.data || {}; let result = null;
      try { if (d.op === "deep") result = deepSearch(d.fen, d.opts); } catch (_) { result = null; }
      postMessage({ id: d.id, result });
    };
  }
  // تسخين مرة واحدة والمتصفح فاضي: أول غلطة للطالب ما تدفعش تمن تجهيز الـ JS (وإلا أول رد ممكن ياخد 30ms+)
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const warm = () => { try { for (let i = 0; i < 3; i++) findExactRefutation("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "c4f7"); } catch (_) {} };
    if (window.requestIdleCallback) window.requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500);
  }
})(typeof window !== "undefined" ? window : globalThis);
