// ECA — gmcoach.js: كوتش الجراند ماستر
// 1) GrandmasterMoveClassifier: كل نقلة بتاخد درجة من 10 زي Chess.com (!! ! ★ 👍 ✓ 📖 ?! ? ⚡ ??) من نسبة المكسب (Win%)
//    قبل وبعد النقلة: Win% = 50 + 50 × (2 / (1 + e^(-0.00368208 × cp)) − 1).
// 2) الشرح بيتبني من خط التكملة الحقيقي للمحرك بعد ما يتراجع على الرقعة (PositionConceptAnalyzer في analyzer.js):
//    مفيش «قطعة من غير حماية» إلا لو مفيش ولا حامي فعلاً، ومفيش «بتخسر قطعة» إلا لو الحساب بعد الأكل المضاد بيقول كده.
// 3) كارت الكوتش (4 طبقات) + شارة على مربع النقلة + «▶ وريني التكملة على الرقعة» + أصوات من نفس AudioContext بتاع الموقع.
// المحرك: Stockfish في رقعة التحليل (extras.js)، ومحرك الموقع (analyzer.js) في Web Worker للألغاز ولو Stockfish مش متاح.
// حل اللغز بيتقري من الذاكرة بس (S.sol)، ومفيش نقلة من الحل بتتكتب في الصفحة طول ما اللغز شغال.
(function (root) {
  // ================= الجزء الثابت (من غير DOM: بيتجرّب في Node) =================
  const EN = () => typeof lang !== "undefined" && lang === "en";
  const T = (ar, en) => (EN() ? en : ar);
  const H = s => (typeof esc === "function" ? esc(s) : String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const TIERS = {
    BRILLIANT: { sym: "!!", color: "#1BACA6", ar: "نقلة عبقرية", en: "Brilliant", sound: "brilliant" },
    GREAT: { sym: "!", color: "#5C8BB0", ar: "نقلة عظيمة", en: "Great move", sound: "great" },
    BEST: { sym: "★", color: "#81B64C", ar: "أفضل نقلة", en: "Best move", sound: "best" },
    EXCELLENT: { sym: "👍", color: "#96BC4B", ar: "نقلة ممتازة", en: "Excellent", sound: "best" },
    GOOD: { sym: "✓", color: "#97AF8B", ar: "نقلة جيدة", en: "Good", sound: "good" },
    BOOK: { sym: "📖", color: "#A88865", ar: "نقلة كتاب نظرية", en: "Book move", sound: "good" },
    INACCURACY: { sym: "?!", color: "#F7C631", ar: "نقلة غير دقيقة", en: "Inaccuracy", sound: "inaccuracy" },
    MISTAKE: { sym: "?", color: "#E68A00", ar: "خطأ", en: "Mistake", sound: "mistake" },
    MISSED_WIN: { sym: "⚡", color: "#E69D00", ar: "فرصة فوز ضائعة", en: "Missed win", sound: "missed" },
    BLUNDER: { sym: "??", color: "#CA3431", ar: "خطأ فادح", en: "Blunder", sound: "blunder" }
  };
  const GOOD_TIERS = ["BRILLIANT", "GREAT", "BEST", "EXCELLENT", "GOOD", "BOOK"];
  const winPct = cp => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  // تقييم {cp, mate} من ناحية واحد → رقم: المات = ±10000 (أقرب مات أعلى)
  function evCp(e) {
    if (!e) return 0;
    if (e.mate != null) return e.mate === 0 ? -10000 : e.mate > 0 ? 10000 - e.mate * 10 : -10000 - e.mate * 10;
    return Number(e.cp) || 0;
  }
  const flipEv = e => (e ? { cp: e.cp == null ? null : -e.cp, mate: e.mate == null ? null : -e.mate } : null);
  // حدود Win% بالظبط (Chess.com): أفضل ≤ 1، ممتازة ≤ 3، جيدة ≤ 6.5، غير دقيقة ≤ 11.5، خطأ ≤ 22، وأكتر = خطأ فادح.
  // gap = Win%(أحسن نقلة) − Win%(تاني أحسن نقلة) من MultiPV 3: عبقرية محتاجة ≥ 12، وعظيمة ≥ 18
  const LIM = { best: 1.0, brilliant: 1.5, excellent: 3.0, good: 6.5, inaccuracy: 11.5, mistake: 22.0, gapBrilliant: 12, gapGreat: 18 };
  const r1 = v => Math.round(v * 10) / 10;
  // التصنيف بالترتيب: كتاب ← عبقرية ← عظيمة ← أفضل ← ممتازة ← جيدة ← غير دقيقة ← خطأ ← فرصة فوز ضائعة ← خطأ فادح.
  // o = { book, isBest, puzzle, sacrifice, best, second, after, lossCp, tacticalWin, routine, mateNow, development, quiet, zwischenzug }
  // التقييمات كلها من ناحية اللي لعب
  function classify(o) {
    const c1 = evCp(o.best), cP = evCp(o.after), c2 = o.second ? evCp(o.second) : null;
    const w1 = winPct(c1), wP = winPct(cP), w2 = c2 == null ? null : winPct(c2);
    const winLoss = Math.max(0, w1 - wP), gap = w2 == null ? null : w1 - w2, cpLoss = Math.max(0, c1 - cP);
    const out = tier => ({ tier, winBefore: r1(w1), winAfter: r1(wP), winLoss: r1(winLoss), gap: gap == null ? null : r1(gap), cpLoss, bestCp: c1, afterCp: cP, secondCp: c2 });
    if (o.book) return out("BOOK");
    const bestMate = !!(o.best && o.best.mate > 0);
    // في اللغز: النقلة الغلط عمرها ما تبقى «أفضل نقلة» حتى لو بتكسب برضه (الحل واحد)
    const top = o.isBest === true || (!(o.puzzle && o.isBest === false) && winLoss <= LIM.best);
    const saves = c2 != null && c2 <= -150 && cP >= -50;   // كل البدايل بتخسر والنقلة دي بس اللي بتمسك الموقف
    // 2) عبقرية: تضحية حقيقية وأحسن نقلة وبتكسب (أو بتنقذ) ومفيش بديل قريب منها
    if ((o.isBest === true || (!(o.puzzle && o.isBest === false) && winLoss <= LIM.brilliant)) && o.sacrifice && (cP >= 150 || saves) && (gap == null ? !!o.puzzle : gap >= LIM.gapBrilliant)) return out("BRILLIANT");
    // 3) عظيمة (نادرة): النقلة الوحيدة (gap ≥ 18%) + قلبة حاسمة أو إنقاذ أو فكرة هادية/بينية مش واضحة.
    //    مش للأكل الروتيني، ولا الانتشار العادي، ولا المات في نقلة، ولا لما أكتر من نقلة بتكسب بسهولة
    if (top && gap != null && gap >= LIM.gapGreat && !o.routine && !o.mateNow && !o.development) {
      if ((c1 >= 150 && c2 <= 30) || saves || o.quiet === true || o.zwischenzug === true) return out("GREAT");
    }
    if (top) return out("BEST");
    if (o.after && o.after.mate != null && o.after.mate < 0 && !(o.best && o.best.mate != null && o.best.mate < 0)) return out("BLUNDER");   // دخل في مات
    let t = winLoss <= LIM.excellent ? "EXCELLENT" : winLoss <= LIM.good ? "GOOD" : winLoss <= LIM.inaccuracy ? "INACCURACY" : winLoss <= LIM.mistake ? "MISTAKE" : "";
    if (o.puzzle && (t === "EXCELLENT" || t === "GOOD")) t = "INACCURACY";
    if (t === "MISTAKE" && o.lossCp <= -250 && cP < 300) t = "BLUNDER";   // خسر قطعة واضحة والموقف مش لسه كسبان
    if (t) return out(t);
    // 9) فرصة فوز ضائعة: كان في مات أو مكسب ≥ +3 والنقلة نزّلت التقييم لأقل من +1.2 من غير ما تخسر هي نفسها (≥ −0.5)
    if ((c1 >= 300 || bestMate) && cP < 120 && cP >= -50 && !(o.lossCp <= -200) && o.tacticalWin !== false) return out("MISSED_WIN");
    return out("BLUNDER");
  }
  // دقة النقلة من خسارة Win% (معادلة Lichess) — مراجعة الدور بتاخد متوسطها لكل لاعب
  const accuracy = winLoss => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * Math.max(0, winLoss)) - 3.1669));

  // ---------- النصوص ----------
  const PIECE = { p: ["البيدق (العسكري)", "pawn"], n: ["الحصان", "knight"], b: ["الفيل", "bishop"], r: ["الرخ (القلعة)", "rook"], q: ["الوزير", "queen"], k: ["الملك", "king"] };
  const pn = t => { const x = PIECE[t]; return x ? T(x[0], "the " + x[1]) : T("قطعة", "a piece"); };
  const P = t => `<b>${pn(t)}</b>`;
  const SQ = s => `<bdi dir="ltr" class="eca-sq-tok">${H(s)}</bdi>`;
  const SAN = s => `<bdi dir="ltr" class="eca-san">${H(s)}</bdi>`;
  const tierName = t => (TIERS[t] ? T(TIERS[t].ar, TIERS[t].en) : "");
  const CONCEPT_NAME = {
    fork: ["شوكة مزدوجة", "fork"], pinAbs: ["ربط مطلق", "absolute pin"], pinRel: ["ربط نسبي", "relative pin"], skewer: ["سيخ", "skewer"],
    discovered: ["هجوم بالكشف", "discovered attack"], discoveredCheck: ["كش بالكشف", "discovered check"], deflection: ["تشتيت المدافع المشغول", "deflecting an overloaded defender"],
    decoy: ["استدراج لمربع قاتل", "decoy"], removalGuard: ["إزالة المدافع", "removal of the guard"], backRank: ["ضعف الصف الأخير", "back-rank weakness"],
    smothered: ["مات الخنق (Smothered)", "smothered mate"], arabian: ["المات العربي", "Arabian mate"], anastasia: ["مات أناستازيا", "Anastasia's mate"],
    zwischenzug: ["نقلة بينية مفاجئة (Zwischenzug)", "zwischenzug"], trapped: ["حبس قطعة", "trapped piece"], kingSafety: ["كشف حماية الملك", "king safety"],
    openFile: ["السيطرة على العمود المفتوح", "open file control"], passedPawn: ["البيدق السالك", "passed pawn"], outpost: ["مربع ارتكاز قوي للحصان", "knight outpost"],
    development: ["الانتشار والسيطرة على الوسط", "development and center control"]
  };
  const TACTICS = ["fork", "pinAbs", "pinRel", "skewer", "discoveredCheck", "discovered", "deflection", "decoy", "removalGuard", "zwischenzug", "trapped", "smothered", "arabian", "anastasia", "backRank"];
  const cName = k => (CONCEPT_NAME[k] ? T(CONCEPT_NAME[k][0], CONCEPT_NAME[k][1]) : "");
  function conceptText(c) {
    const and = T(" و", " and ");
    switch (c.key) {
      case "fork": return T(`<b>شوكة مزدوجة</b>: ${P(c.piece)} في ${SQ(c.sq)} بيهاجم ${c.targets.map(x => P(x.type) + " " + SQ(x.sq)).join(and)} في نفس الوقت`, `<b>fork</b>: ${P(c.piece)} on ${SQ(c.sq)} hits ${c.targets.map(x => P(x.type) + " " + SQ(x.sq)).join(and)} at once`);
      case "pinAbs": return T(`<b>ربط مطلق</b>: ${P(c.front.type)} في ${SQ(c.front.sq)} مربوط بالملك في ${SQ(c.behind.sq)} ومش قادر يتحرك`, `<b>absolute pin</b>: ${P(c.front.type)} on ${SQ(c.front.sq)} is pinned to the king on ${SQ(c.behind.sq)}`);
      case "pinRel": return T(`<b>ربط نسبي</b>: لو ${P(c.front.type)} في ${SQ(c.front.sq)} اتحرك، ${P(c.behind.type)} في ${SQ(c.behind.sq)} بيضيع`, `<b>relative pin</b>: if ${P(c.front.type)} on ${SQ(c.front.sq)} moves, ${P(c.behind.type)} on ${SQ(c.behind.sq)} falls`);
      case "skewer": return T(`<b>سيخ</b>: ${P(c.piece)} بيهاجم ${P(c.front.type)} في ${SQ(c.front.sq)}، ولما يتحرك ${P(c.behind.type)} في ${SQ(c.behind.sq)} بيتاكل`, `<b>skewer</b>: ${P(c.piece)} attacks ${P(c.front.type)} on ${SQ(c.front.sq)}, and when it moves ${P(c.behind.type)} on ${SQ(c.behind.sq)} is taken`);
      case "discovered": return T(`<b>هجوم بالكشف</b>: ${P(c.by)} في ${SQ(c.bySq)} بقى يهاجم ${P(c.target)} في ${SQ(c.targetSq)}`, `<b>discovered attack</b>: ${P(c.by)} on ${SQ(c.bySq)} now hits ${P(c.target)} on ${SQ(c.targetSq)}`);
      case "discoveredCheck": return T(`<b>كش بالكشف</b>: ${P(c.by)} في ${SQ(c.bySq)} بيكش الملك في ${SQ(c.targetSq)}`, `<b>discovered check</b>: ${P(c.by)} on ${SQ(c.bySq)} checks the king on ${SQ(c.targetSq)}`);
      case "deflection": return T(`<b>تشتيت المدافع المشغول</b>: ${P(c.defender.type)} في ${SQ(c.defender.sq)} اتشد بعيد عن حماية ${SQ(c.target)}`, `<b>deflection</b>: ${P(c.defender.type)} on ${SQ(c.defender.sq)} is pulled away from guarding ${SQ(c.target)}`);
      case "decoy": return T(`<b>استدراج</b>: ${P(c.piece)} اتشد لمربع ${SQ(c.sq)} القاتل`, `<b>decoy</b>: ${P(c.piece)} is lured to the deadly square ${SQ(c.sq)}`);
      case "removalGuard": return T(`<b>إزالة المدافع</b>: أكل ${P(c.guard.type)} في ${SQ(c.guard.sq)} اللي كان حامي ${SQ(c.target)}`, `<b>removal of the guard</b>: taking ${P(c.guard.type)} on ${SQ(c.guard.sq)}, the defender of ${SQ(c.target)}`);
      case "backRank": return T(`<b>ضعف الصف الأخير</b>: الملك في ${SQ(c.king)} محبوس ورا بيادقه`, `<b>back-rank weakness</b>: the king on ${SQ(c.king)} is boxed in by its own pawns`);
      case "smothered": return T(`<b>مات الخنق (Smothered)</b>: الملك في ${SQ(c.king)} محاصر بقطعه والحصان بيموّته`, `<b>smothered mate</b>: the king on ${SQ(c.king)} is boxed in by its own pieces and a knight mates`);
      case "arabian": return T(`<b>المات العربي</b>: رخ وحصان بيموّتوا الملك في الركن ${SQ(c.king)}`, `<b>Arabian mate</b>: rook and knight mate the king in the corner ${SQ(c.king)}`);
      case "anastasia": return T(`<b>مات أناستازيا</b>: حصان ورخ على حافة الرقعة حوالين الملك في ${SQ(c.king)}`, `<b>Anastasia's mate</b>: knight and rook trap the king on the edge at ${SQ(c.king)}`);
      case "zwischenzug": return T(`<b>نقلة بينية مفاجئة (Zwischenzug)</b>: بدل الأخذ على طول في ${SQ(c.sq)}، نقلة إجبارية الأول`, `<b>zwischenzug</b>: instead of recapturing on ${SQ(c.sq)} at once, a forcing move first`);
      case "trapped": return T(`<b>حبس قطعة</b>: ${P(c.target.type)} في ${SQ(c.target.sq)} مالوش مربع هروب آمن`, `<b>trapped piece</b>: ${P(c.target.type)} on ${SQ(c.target.sq)} has no safe square`);
      case "kingSafety": return c.own ? T(`<b>كشف حماية الملك</b>: البيدق اللي كان في ${SQ(c.sq)} كان درع الملك`, `<b>king safety</b>: the pawn from ${SQ(c.sq)} was the king's shield`) : T(`<b>كشف ملك الخصم</b>: القطعة اللي اتاكلت في ${SQ(c.sq)} كانت جنب الملك`, `<b>exposing the king</b>: the piece taken on ${SQ(c.sq)} sat next to the king`);
      case "openFile": return T(`<b>السيطرة على العمود ${c.open === "open" ? "المفتوح" : "شبه المفتوح"}</b> ${SQ(c.file)}`, `<b>control of the ${c.open === "open" ? "open" : "half-open"} file</b> ${SQ(c.file)}`);
      case "passedPawn": return T(`<b>البيدق السالك</b> في ${SQ(c.sq)}: مفيش بيدق للخصم قدامه يوقفه`, `<b>passed pawn</b> on ${SQ(c.sq)}: no enemy pawn can stop it`);
      case "outpost": return T(`<b>مربع ارتكاز قوي للحصان</b> في ${SQ(c.sq)}: محمي ببيدق ومفيش بيدق للخصم يطرده`, `<b>knight outpost</b> on ${SQ(c.sq)}: protected by a pawn and no enemy pawn can chase it`);
      case "development": return c.castle ? T("<b>أمان الملك</b> بالتبييت", "<b>king safety</b> by castling") : T("<b>الانتشار والسيطرة على الوسط</b>", "<b>development and center control</b>");
      default: return "";
    }
  }
  // التقييم للعرض من ناحية الأبيض: +2.4 أو M3 أو -M2
  function evalText(e, mover) {
    if (!e) return "";
    const s = mover === "b" ? -1 : 1;
    if (e.mate != null) { const m = e.mate * s; return m === 0 ? "#" : (m > 0 ? "M" : "-M") + Math.abs(m); }
    const v = (Number(e.cp) || 0) * s / 100;
    return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
  }
  function evalWords(e) {
    if (!e) return "";
    if (e.mate != null) return e.mate > 0 ? T(`كش مات في ${e.mate}`, `mate in ${e.mate}`) : T(`الخصم عنده كش مات في ${-e.mate}`, `opponent mates in ${-e.mate}`);
    const v = (Number(e.cp) || 0) / 100;
    return `<bdi dir="ltr">${v > 0 ? "+" : ""}${v.toFixed(1)}</bdi>`;
  }
  function lossWords(cp) {
    const a = Math.abs(cp);
    if (a >= 800) return T("حوالي وزير", "about a queen");
    if (a >= 430) return T("حوالي رخ", "about a rook");
    if (a >= 260) return T("قطعة كاملة", "a whole piece");
    if (a >= 150) return T("قطعة مقابل بيدق أو فرق الجودة", "a piece for a pawn, or the exchange");
    return T("بيدق", "a pawn");
  }
  // اللي اتاخد واللي اتكسب على الخط فعلاً: «الحصان مقابل البيدق»
  function tradeWords(line, color) {
    const lost = [], won = [];
    line.steps.forEach(s => { if (!s.captured) return; (s.color === color ? won : lost).push(s.captured); });
    const names = a => a.map(pn).join(T(" و", " and "));
    if (!lost.length) return "";
    return won.length ? T(`${names(lost)} مقابل ${names(won)}`, `${names(lost)} for ${names(won)}`) : names(lost);
  }
  const moveLabel = (st, san) => SAN(st.moveNo + (st.color === "w" ? ". " : "... ") + (san || st.uci));
  function stepDesc(st) {
    const bits = [];
    if (st.castle) bits.push(T("تبييت", "castles"));
    else if (st.captured) bits.push(T(`${pn(st.piece)} ياكل ${pn(st.captured)} في ${SQ(st.capSq)}`, `${pn(st.piece)} takes ${pn(st.captured)} on ${SQ(st.capSq)}`));
    else bits.push(T(`${pn(st.piece)} يروح ${SQ(st.to)}`, `${pn(st.piece)} to ${SQ(st.to)}`));
    if (st.promo) bits.push(T("ويترقّى لـ " + pn(st.promo), "promoting to " + pn(st.promo)));
    if (st.mate) bits.push(T("<b>كش مات</b>", "<b>checkmate</b>")); else if (st.check) bits.push(T("كش", "check"));
    const c = st.concepts.find(x => TACTICS.includes(x.key)); if (c) bits.push(`<b>${cName(c.key)}</b>`);
    return bits.join(T("، ", ", "));
  }
  function resultText(rv) {
    const L = rv.refLine, me = rv.color;
    if (L.mate && L.mate !== me) return T("والنتيجة: <b>كش مات</b>.", "Result: <b>checkmate</b>.");
    if (L.mate === me) return T("والنتيجة: <b>كش مات</b> لصالحك.", "Result: <b>checkmate</b> for you.");
    const tw = tradeWords(L, me);
    if (L.net <= -70) return T(`والنتيجة بعد سلسلة الأكل والأكل المضاد: بتخسر ${lossWords(L.net)} صافي${tw ? ` (${tw})` : ""}.`, `Result after all the captures: you lose ${lossWords(L.net)}${tw ? ` (${tw})` : ""}.`);
    if (L.net >= 70) return T(`والنتيجة: بتكسب ${lossWords(L.net)} صافي.`, `Result: you win ${lossWords(L.net)}.`);
    if (L.steps.some(s => s.captured)) return T("والنتيجة: <b>تبادل متكافئ</b> — نفس القيمة للطرفين.", "Result: an <b>equal trade</b>.");
    return T(`والتقييم بعدها ${evalWords(rv.after)}.`, `The evaluation afterwards is ${evalWords(rv.after)}.`);
  }
  // الطبقة 2: التكملة نقلة نقلة بالعربي (أول 4-5 نقلات بعد نقلتك)
  function continuationText(rv) {
    const s = rv.refLine.steps.slice(1, 6), me = rv.color;
    if (!s.length) return rv.refLine.mate ? T("نقلتك أنهت الدور بكش مات!", "Your move ends the game with checkmate!") : T("مفيش تكملة محسوبة للموقف ده.", "No calculated continuation for this position.");
    const good = GOOD_TIERS.includes(rv.tier);
    const parts = s.map((st, i) => {
      const mine = st.color === me;
      const lead = i === 0 ? (mine ? T("تلعب", "you play") : T("يرد الخصم بـ", "your opponent answers"))
        : mine ? (st.captured ? T("ولو أكلت بـ", "and if you take with") : T("ولو لعبت", "and if you play")) : T("يلعب الخصم", "your opponent plays");
      return `${lead} ${moveLabel(st, rv.sans[i + 1])} (${stepDesc(st)})`;
    });
    return `${good ? T("الخطة بعد نقلتك:", "The plan after your move:") : T("التكملة الإجبارية:", "The forced continuation:")} ${parts.join(T("، ", ", "))}. ${resultText(rv)}`;
  }
  // الطبقة 1: الحكم المباشر (كل جملة متأكد منها من الحساب على الرقعة)
  function verdictText(rv) {
    const st0 = rv.refLine.steps[0] || { piece: "", to: "" }, t = TIERS[rv.tier];
    const head = T(`نقلة ${P(st0.piece)} إلى ${SQ(st0.to)} <b>(${t.sym} ${tierName(rv.tier)})</b>`, `${P(st0.piece)} to ${SQ(st0.to)} <b>(${t.sym} ${tierName(rv.tier)})</b>`);
    const own = (st0.concepts || []).map(conceptText).filter(Boolean)[0];
    const L = rv.refLine, fl = L.firstLoss;
    switch (rv.tier) {
      case "BOOK": return head + T(` نقلة معروفة في <b>${H(rv.book.ar)}</b> (${H(rv.book.eco)}).${own ? " " + own + "." : ""}`, ` a known move of the <b>${H(rv.book.en)}</b> (${H(rv.book.eco)}).${own ? " " + own + "." : ""}`);
      case "BRILLIANT": {
        const sq = rv.sac && rv.sac.sq ? rv.sac.sq : st0.to;
        return head + T(` تضحية محسوبة: القطعة في ${SQ(sq)} ممكن تتاكل، لكن ده بالظبط اللي بيكسب: ${rv.best && rv.best.mate > 0 ? `كش مات في ${rv.best.mate}` : `التقييم ${evalWords(rv.after)}`}.`,
          ` a calculated sacrifice: the piece on ${SQ(sq)} can be taken, but that's exactly what wins: ${rv.best && rv.best.mate > 0 ? `mate in ${rv.best.mate}` : `the evaluation is ${evalWords(rv.after)}`}.`);
      }
      case "GREAT": {
        const what = rv.bestCp >= 150 ? T("بتكسب", "wins") : T("بتنقذ الموقف", "saves the position");
        return head + T(` النقلة الوحيدة اللي ${what}: أي نقلة تانية كانت هتنزّل التقييم لـ ${evalWords(rv.second)}.`, ` the only move that ${what}: anything else drops the evaluation to ${evalWords(rv.second)}.`) + (own ? " " + own + "." : "");
      }
      case "BEST": case "EXCELLENT": case "GOOD":
        return head + (own ? " " + own + "." : rv.tier === "BEST" ? T(" دي أدق نقلة في الموقف.", " the most accurate move here.") : T(` بتحافظ على الموقف (نسبة المكسب ${Math.round(rv.winAfter)}%).`, ` keeps the position (win chance ${Math.round(rv.winAfter)}%).`));
      case "MISSED_WIN":
        return head + T(` كان عندك ${rv.best && rv.best.mate > 0 ? `<b>كش مات في ${rv.best.mate}</b>` : `مكسب كبير (${evalWords(rv.best)})`}، والنقلة دي ضيّعته والتقييم رجع لـ ${evalWords(rv.after)}.`,
          ` you had ${rv.best && rv.best.mate > 0 ? `<b>mate in ${rv.best.mate}</b>` : `a big win (${evalWords(rv.best)})`}, and this move let it slip to ${evalWords(rv.after)}.`);
      default: {
        if (L.mate && L.mate !== rv.color) {
          const n = rv.after && rv.after.mate != null ? -rv.after.mate : Math.ceil((L.steps.length - 1) / 2);
          return head + T(` بتسيب ملكك مكشوف وبتسمح للخصم بـ <b>كش مات في ${n}</b>.`, ` leaves your king open to <b>mate in ${n}</b>.`);
        }
        if (fl && L.net <= -70) {
          const tw = tradeWords(L, rv.color);
          if (fl.capDefenders === 0 && !L.lossRecapturable) return head + T(` بتسيب ${P(fl.captured)} في ${SQ(fl.capSq)} <b>من غير أي حماية</b>، والخصم بياكله مجاناً.`, ` leaves ${P(fl.captured)} on ${SQ(fl.capSq)} <b>with no protection</b>, and it's taken for free.`);
          return head + T(` صحيح ${P(fl.captured)} في ${SQ(fl.capSq)} عليه حماية، لكن بعد سلسلة الأكل والأكل المضاد بتخسر ${lossWords(L.net)} صافي${tw ? ` (${tw})` : ""}.`,
            ` ${P(fl.captured)} on ${SQ(fl.capSq)} is protected, but after the whole exchange you lose ${lossWords(L.net)}${tw ? ` (${tw})` : ""}.`);
        }
        if (L.net <= -70) return head + T(` بتخسر ${lossWords(L.net)} بعد ما الأكل يخلص.`, ` loses ${lossWords(L.net)} once the captures are done.`);
        const oppIdea = L.steps.slice(1).filter(s => s.color !== rv.color).flatMap(s => s.concepts).find(c => TACTICS.includes(c.key));
        if (L.steps.some(s => s.captured) && Math.abs(L.net) < 70) return head + T(` <b>تبادل متكافئ</b> (نفس القيمة)، لكنه سابق لأوانه ومش في مصلحتك: نسبة المكسب نزلت من ${Math.round(rv.winBefore)}% لـ ${Math.round(rv.winAfter)}%.`,
          ` an <b>equal trade</b>, but a premature one: your win chance drops from ${Math.round(rv.winBefore)}% to ${Math.round(rv.winAfter)}%.`);
        return head + T(` مفيش قطعة بتضيع على طول، لكن الموقف بيضعف: نسبة المكسب نزلت من ${Math.round(rv.winBefore)}% لـ ${Math.round(rv.winAfter)}%.`, ` nothing is lost at once, but the position gets worse: your win chance drops from ${Math.round(rv.winBefore)}% to ${Math.round(rv.winAfter)}%.`)
          + (oppIdea ? " " + T("الخصم عنده: ", "Your opponent gets: ") + conceptText(oppIdea) + "." : "");
      }
    }
  }
  // الطبقة 3: أفضل نقلة وليه بتنجح (في اللغز الشغال: الفكرة بس من غير النقلة)
  function bestText(rv) {
    if (rv.isBest) return T("✔ أنت لعبت أفضل نقلة في الموقف.", "✔ You played the best move.") + (rv.tier === "GREAT" && rv.second ? " " + T(`تاني أحسن نقلة كانت هتدّي ${evalWords(rv.second)} بس.`, `The next best only gives ${evalWords(rv.second)}.`) : "");
    const bl = rv.bestLine;
    const ideas = bl ? bl.steps.filter(s => s.color === rv.color).slice(0, 2).flatMap(s => s.concepts).filter(c => TACTICS.includes(c.key) || c.key === "passedPawn" || c.key === "outpost" || c.key === "openFile" || c.key === "development") : [];
    if (rv.hideBest) {
      const idea = ideas.length ? cName(ideas[0].key) : (rv.themes && rv.themes.length && typeof LP_NAMES !== "undefined" && LP_NAMES[rv.themes[0]] ? LP_NAMES[rv.themes[0]][EN() ? 1 : 0] : T("تكتيك إجباري", "a forcing tactic"));
      return T(`★ في نقلة أقوى في الموقف ده — فكرتها: <b>${H(idea)}</b>. «مساعدة الكوتش» توصّلك ليها خطوة بخطوة.`, `★ There's a stronger move here — its idea: <b>${H(idea)}</b>. «Coach help» walks you to it step by step.`);
    }
    if (!bl || !bl.steps.length) return T("★ مفيش نقلة أحسن واضحة.", "★ No clearly better move.");
    const b0 = bl.steps[0], why = [];
    if (bl.mate === rv.color) why.push(T(`بتوصّل لـ <b>كش مات في ${rv.best && rv.best.mate > 0 ? rv.best.mate : Math.ceil(bl.steps.length / 2)}</b>`, `leads to <b>mate in ${rv.best && rv.best.mate > 0 ? rv.best.mate : Math.ceil(bl.steps.length / 2)}</b>`));
    ideas.slice(0, 2).forEach(c => why.push(conceptText(c)));
    if (bl.net >= 70 && bl.mate !== rv.color) why.push(T(`بتكسب ${lossWords(bl.net)} صافي`, `wins ${lossWords(bl.net)}`));
    const fl = rv.refLine.firstLoss;
    if (fl && rv.refLine.net <= -70 && bl.net > rv.refLine.net + 70) why.push(b0.from === fl.capSq ? T(`بتبعد ${P(fl.captured)} عن الخطر`, `moves ${P(fl.captured)} out of danger`) : T(`ومش بتسيب ${P(fl.captured)} في ${SQ(fl.capSq)} يضيع`, `and doesn't drop ${P(fl.captured)} on ${SQ(fl.capSq)}`));
    if (!why.length) why.push(T(`بتحافظ على التوازن (${evalWords(rv.best)})`, `keeps the balance (${evalWords(rv.best)})`));
    const line = rv.bestSans.slice(0, 4).map((s, i) => moveLabel(bl.steps[i], s)).join(" ");
    return T(`★ أفضل نقلة كانت: ${moveLabel(b0, rv.bestSans[0])}! — ${why.join("، ")}.`, `★ The best move was ${moveLabel(b0, rv.bestSans[0])}! — ${why.join("; ")}.`) + (bl.steps.length > 1 ? " " + T("الخط:", "Line:") + " " + line : "");
  }
  const RULES = {
    BLUNDER: ["قبل أي نقلة اعمل «فحص الأمان»: الخصم بيهدد إيه؟ مين من قطعي من غير حماية؟ وهل في كش أو مات عليّا؟", "Before every move do a safety check: what does my opponent threaten? Which of my pieces is unprotected? Is there a check or mate against me?"],
    MISTAKE: ["احسب سلسلة الأكل للآخر: عدّ المهاجمين والحماة على المربع قبل ما تحط قطعتك فيه.", "Count captures to the end: attackers versus defenders on the square before you put a piece there."],
    INACCURACY: ["في كل نقلة دوّر على أنشط نقلة: حسّن أسوأ قطعة عندك أو اضغط على نقطة ضعف عند الخصم.", "Every move, look for the most active idea: improve your worst piece or press on a weakness."],
    MISSED_WIN: ["منهج الخطوات: دوّر الأول على النقلات الإجبارية بالترتيب — كش ← أكل ← تهديد.", "Step method: look at forcing moves first, in order — checks, captures, threats."],
    GOOD: ["كويس! اسأل نفسك دايماً: في نقلة أقوى من دي؟", "Good! Always ask: is there an even stronger move?"],
    BOOK: ["في الافتتاح: انشر القطع الخفيفة، سيطر على الوسط، وبيّت بدري.", "In the opening: develop minor pieces, control the center and castle early."]
  };
  function ruleText(rv) {
    if (rv.diag && typeof root.CoachKnowledgeBot === "object" && root.CoachKnowledgeBot.rule && !GOOD_TIERS.includes(rv.tier)) return root.CoachKnowledgeBot.rule(rv.diag);
    const r = RULES[rv.tier] || (GOOD_TIERS.includes(rv.tier) ? ["برافو! كمّل بنفس التركيز: شوف تهديد الخصم الأول، وبعدها دوّر على أقوى نقلة.", "Well done! Keep it up: check your opponent's threat first, then look for your strongest move."] : RULES.MISTAKE);
    return T(r[0], r[1]);
  }
  // SAN لكل نقلة على الخط (chess.js)
  function sanList(fen, ucis) {
    const C = typeof ChessCls !== "undefined" && ChessCls ? ChessCls : root.ChessCls;
    if (!C) return ucis.slice();
    let c; try { c = new C(fen); } catch (_) { return ucis.slice(); }
    const out = [];
    for (const u of ucis) { let r = null; try { r = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined }); } catch (_) {} if (!r) break; out.push(r.san); }
    return out;
  }
  function fenAfter(fen, u) {
    const C = typeof ChessCls !== "undefined" && ChessCls ? ChessCls : root.ChessCls;
    if (C) { try { const c = new C(fen); if (c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined })) return c.fen(); } catch (_) {} }
    const w = root.PositionConceptAnalyzer.walkLine(fen, [u]); return w.steps[0] ? w.steps[0].fen : fen;
  }
  // ===== النقلة كلها: تصنيف + خط مُتحقق منه + النصوص =====
  // o = { preFen, uci, pre, post, ply, puzzle, isBest, hideBest, refPv, themes, diag }
  // pre/post = نتيجة محرك ({ lines: [{ uci, cp, mate, pv }], over }) من ناحية اللي عليه الدور في الموقف ده
  function review(o) {
    const PCA = root.PositionConceptAnalyzer, mover = String(o.preFen).split(" ")[1] === "b" ? "b" : "w";
    const best = o.pre && o.pre.lines && o.pre.lines[0] ? o.pre.lines[0] : null, second = o.pre && o.pre.lines ? o.pre.lines[1] || null : null;
    const over = o.post && o.post.over;
    const after = over === "mate" ? { cp: null, mate: 1 } : over ? { cp: 0, mate: null } : o.post && o.post.lines && o.post.lines[0] ? flipEv(o.post.lines[0]) : best ? { cp: best.cp, mate: best.mate } : { cp: 0, mate: null };
    const isBest = o.isBest != null ? !!o.isBest : !!best && (best.uci === o.uci || (over === "mate"));
    const postFen = fenAfter(o.preFen, o.uci);
    const book = !o.puzzle && o.ply != null && o.ply <= 12 && root.EcaOpeningBook ? root.EcaOpeningBook.lookup(postFen) : null;
    const sac = PCA.sacrifice(o.preFen, o.uci);
    const refPv = (o.refPv || (o.post && o.post.lines && o.post.lines[0] ? o.post.lines[0].pv : []) || []).slice(0, 5);
    const refLine = PCA.verifyLine(o.preFen, [o.uci].concat(refPv));
    const bestPv = best && best.pv ? best.pv.slice(0, 6) : [];
    const bestLine = bestPv.length && !isBest ? PCA.verifyLine(o.preFen, bestPv) : null;
    // «ضربة قاضية» = أحسن خط بيمات أو بيكسب خامات فعلاً (مش مجرد تقدم كان موجود من قبل)
    const tacticalWin = !!(best && best.mate > 0) || !!(bestLine && (bestLine.mate === mover || bestLine.net >= 200));
    // نقلة بينية: الخصم لسه آكل على مربع، وبدل الأخذ تاني على طول لعبنا كش أو أكل في حتة تانية
    let zw = false;
    if (o.prevFen && o.prevUci) { const ps = PCA.walkLine(o.prevFen, [o.prevUci]).steps[0]; zw = !!(ps && ps.captured && o.uci.slice(2, 4) !== ps.to && (sac.check || sac.capture)); }
    const st0 = refLine.steps[0];
    const cls = classify({ book: !!book, isBest, puzzle: !!o.puzzle, sacrifice: sac.is, best: best || after, second, after, lossCp: refLine.net, tacticalWin: isBest ? true : tacticalWin,
      routine: !!sac.routineCapture, mateNow: !!(st0 && st0.mate), development: !!(st0 && st0.concepts.some(c => c.key === "development")), quiet: !sac.capture && !sac.check, zwischenzug: zw });
    const rv = Object.assign(cls, { uci: o.uci, color: mover, preFen: o.preFen, postFen, book, sac, isBest, best: best ? { cp: best.cp, mate: best.mate } : null, second: second ? { cp: second.cp, mate: second.mate } : null, after,
      refLine, bestLine, sans: sanList(o.preFen, refLine.steps.map(s => s.uci)), bestSans: bestLine ? sanList(o.preFen, bestLine.steps.map(s => s.uci)) : [],
      hideBest: !!o.hideBest, puzzle: !!o.puzzle, themes: o.themes || [], diag: o.diag || null, bestUci: best ? best.uci : "", refUci: refPv[0] || "",
      ply: o.ply, sym: TIERS[cls.tier].sym, color2: TIERS[cls.tier].color });
    rv.evalTxt = evalText(after, mover);
    rv.text = { title: `${TIERS[rv.tier].sym} ${tierName(rv.tier)} (${TIERS[rv.tier].en})`, verdict: verdictText(rv), continuation: continuationText(rv), best: bestText(rv), rule: ruleText(rv) };
    return rv;
  }
  function cardHTML(rv, o) {
    o = o || {};
    const t = TIERS[rv.tier], diag = o.diagHTML ? `<p class="eca-gm-diag">${o.diagHTML}</p>` : "";
    const followBtn = o.follow === false ? "" : `<button type="button" onclick="ecaGMFollow()" class="tap eca-gm-follow">▶ ${T("وريني التكملة على الرقعة", "Show the follow-up on the board")}</button>`;
    return `<section class="eca-coach-panel eca-gm-card${o.keep ? " eca-fs-keep" : ""}" data-tier="${rv.tier}" style="--gm:${t.color}" aria-label="${T("شرح الكوتش", "Coach explanation")}">
      <header><span class="eca-gm-badge" aria-hidden="true">${t.sym}</span><span class="eca-gm-head"><b class="eca-gm-title">${H(rv.text.title)}</b>${rv.evalTxt ? `<span class="eca-gm-eval" dir="ltr" title="${T("التقييم بعد النقلة", "Evaluation after the move")}">${H(rv.evalTxt)}</span>` : ""}</span>${o.close ? `<button type="button" onclick="coachPanelClose()" class="tap eca-coach-x" title="${T("اقفل الشرح", "Close")}" aria-label="${T("اقفل الشرح", "Close")}">✕</button>` : ""}</header>
      <div class="eca-gm-layer" data-layer="1"><h4>1. ${T("الحكم المباشر", "The verdict")}</h4><p>${rv.text.verdict}</p>${diag}</div>
      <div class="eca-gm-layer" data-layer="2"><h4>2. ${T("سيناريو التكملة المحسوب", "The calculated continuation")}</h4><p>${rv.text.continuation}</p></div>
      <div class="eca-gm-layer" data-layer="3"><h4>3. ${T("البديل الأفضل ولماذا ينجح", "The best move and why it works")}</h4><p>${rv.text.best}</p></div>
      <div class="eca-gm-layer eca-gm-actions" data-layer="4">${followBtn}${o.extra || ""}</div>
      <p class="eca-gm-rule">🧭 ${rv.text.rule}</p>
    </section>`;
  }
  root.GrandmasterMoveClassifier = { TIERS, ORDER: Object.keys(TIERS), LIM, winPct, accuracy, evCp, flipEv, classify, review, cardHTML, evalText, conceptText, tierName, sanList };
  if (typeof document === "undefined" || typeof arena === "undefined") return;   // Node: الجزء الثابت بس

  // ================= المحرك: Web Worker لمحرك الموقف (من غير ما الصفحة تقف) =================
  const GM = { cache: new Map(), w: null, wid: 0, pend: new Map(), failed: false, engine: "auto" };
  function workerSrc() { const s = document.querySelector('script[src*="js/analyzer.js"]'); return s ? s.src : new URL("js/analyzer.js", document.baseURI).href; }
  function internal(fen, opts) {
    return new Promise(resolve => {
      const local = () => setTimeout(() => { let r = null; try { r = root.ChessPositionAnalyzer.deepSearch(fen, opts); } catch (_) {} resolve(r); }, 0);
      if (GM.failed || typeof Worker === "undefined") return local();
      try {
        if (!GM.w) {
          GM.w = new Worker(URL.createObjectURL(new Blob([`importScripts(${JSON.stringify(workerSrc())});`], { type: "application/javascript" })));
          GM.w.onmessage = e => { const d = e.data || {}, cb = GM.pend.get(d.id); if (cb) { GM.pend.delete(d.id); cb(d.result); } };
          GM.w.onerror = () => { GM.failed = true; try { GM.w.terminate(); } catch (_) {} GM.w = null; const cbs = [...GM.pend.values()]; GM.pend.clear(); cbs.forEach(cb => cb(undefined)); };
        }
        const id = ++GM.wid;
        GM.pend.set(id, r => (r === undefined ? local() : resolve(r)));
        GM.w.postMessage({ op: "deep", id, fen, opts });
      } catch (_) { GM.failed = true; local(); }
    });
  }
  // أحسن نتيجة معروفة لكل موقف (Stockfish أولى، وبعدها الأعمق)
  const fkey = fen => String(fen).split(" ").slice(0, 4).join(" ");
  function store(fen, r) {
    if (!r) return;
    const k = fkey(fen), old = GM.cache.get(k);
    if (!old || (r.src === "sf" && old.src !== "sf") || (r.src === old.src && (r.depth || 0) >= (old.depth || 0))) GM.cache.set(k, r);
    if (GM.cache.size > 400) GM.cache.delete(GM.cache.keys().next().value);
  }
  const get = fen => GM.cache.get(fkey(fen)) || null;

  // ================= Stockfish 19 (WASM lite، خيط واحد) للتحليل والمراجعة =================
  // عمق 12-16 بـ MultiPV 3 في أقل من ثانية ونص. طابور بأولويات: 0 = الموقف اللي قدامك، 1 = نقلات دور شغال،
  // 2 = مراجعة الدور في الخلفية (بتشتغل بس ورقعة التحليل مفتوحة، عشان مايسرقش المعالج من لعبة تانية).
  // لو Stockfish مش متاح (من غير WebAssembly أو الملف ما اتحمّلش): محرك الموقف في الـ Worker بنفس الشكل.
  const SF = { w: null, dead: false, job: null, q: [], watch: 0, pend: new Map() };
  const sfSrc = () => new URL("vendor/stockfish-19-lite-single.js", document.baseURI).href;
  const useInternal = () => SF.dead || GM.engine === "internal" || typeof WebAssembly === "undefined";
  function sfBoot() {
    if (SF.w || SF.dead) return SF.w;
    try {
      SF.w = new Worker(sfSrc());
      SF.w.onmessage = e => sfLine(String(e.data));
      SF.w.onerror = () => sfFail();
      SF.w.postMessage("uci"); SF.w.postMessage("isready");
    } catch (_) { sfFail(); }
    return SF.w;
  }
  function sfFail() {
    SF.dead = true; clearTimeout(SF.watch);
    try { if (SF.w) SF.w.terminate(); } catch (_) {}
    SF.w = null;
    const j = SF.job; SF.job = null;
    if (j) { j.started = false; SF.q.unshift(j); }
    pump();
  }
  // analyze(fen, { multiPV, depth, movetime, prio, onInfo }) → Promise({ lines: [{ uci, cp, mate, pv, depth }], depth, src, over })
  function analyze(fen, o) {
    o = Object.assign({ multiPV: 3, depth: 16, movetime: 1500, prio: 1 }, o || {});
    const k = fkey(fen), have = get(fen);
    if (have && (have.over || ((have.multi || 1) >= o.multiPV && (have.src === "sf" || useInternal())))) return Promise.resolve(have);
    const p = SF.pend.get(k);
    if (p) {
      const j = p.job;
      if (o.prio < j.prio) j.prio = o.prio;
      if (o.onInfo) j.onInfo = o.onInfo;
      if (!j.started) { j.multiPV = Math.max(j.multiPV, o.multiPV); j.depth = Math.max(j.depth, o.depth); j.movetime = Math.max(j.movetime, o.movetime); }
      pump();
      return p.promise;
    }
    const job = { fen, key: k, multiPV: o.multiPV, depth: o.depth, movetime: o.movetime, prio: o.prio, onInfo: o.onInfo || null, lines: [], depthDone: 0, started: false };
    const promise = new Promise(res => { job.resolve = res; });
    SF.pend.set(k, { job, promise }); SF.q.push(job);
    pump();
    return promise;
  }
  const eligible = j => j.prio < 2 || (typeof tab !== "undefined" && tab === "arena" && arena.sub === "analysis");
  function finish(job, r) {
    if (SF.job === job) SF.job = null;
    SF.pend.delete(job.key);
    if (r) store(job.fen, r);
    try { job.resolve(r || get(job.fen)); } catch (_) {}
    pump();
  }
  function pump() {
    if (SF.job) return;
    SF.q.sort((a, b) => a.prio - b.prio);
    const i = SF.q.findIndex(eligible); if (i < 0) return;
    const job = SF.q.splice(i, 1)[0];
    let g = null; try { g = new ChessCls(job.fen); } catch (_) {}
    if (!g) return finish(job, null);
    if (g.isGameOver()) return finish(job, { fen: job.fen, lines: [], depth: 99, src: "sf", multi: 9, over: g.isCheckmate() ? "mate" : g.isStalemate() ? "stalemate" : "draw" });
    SF.job = job; job.started = true;
    if (useInternal()) {
      internal(job.fen, { multiPV: job.multiPV, maxNodes: job.prio === 0 ? 260000 : 150000, budget: 2500 }).then(r => { if (r) { r.src = "eca"; r.multi = job.multiPV; } finish(job, r); });
      return;
    }
    const w = sfBoot();
    if (!w) return;   // sfFail رجّع الشغلانة للطابور وشغّل محرك الموقف
    clearTimeout(SF.watch); SF.watch = setTimeout(() => { if (SF.job === job) sfFail(); }, job.movetime + 9000);
    w.postMessage("setoption name MultiPV value " + job.multiPV);
    w.postMessage("position fen " + job.fen);
    w.postMessage("go depth " + job.depth + " movetime " + job.movetime);
  }
  function sfLine(line) {
    const job = SF.job; if (!job) return;
    if (line.startsWith("bestmove")) {
      clearTimeout(SF.watch);
      const lines = job.lines.filter(Boolean);
      return finish(job, lines.length ? { fen: job.fen, lines, depth: job.depthDone, src: "sf", multi: job.multiPV } : null);
    }
    if (!line.startsWith("info") || line.indexOf(" pv ") < 0 || / (lower|upper)bound/.test(line)) return;
    const k = Number((line.match(/ multipv (\d+)/) || [0, 1])[1]) - 1; if (k < 0 || k >= job.multiPV) return;
    const cp = line.match(/ score cp (-?\d+)/), mt = line.match(/ score mate (-?\d+)/), d = +((line.match(/ depth (\d+)/) || [])[1] || 0);
    const pv = ((line.match(/ pv (.+)$/) || [])[1] || "").trim().split(/\s+/).filter(Boolean);
    if (!pv.length) return;
    job.lines[k] = { uci: pv[0], pv, cp: cp ? Number(cp[1]) : null, mate: mt ? Number(mt[1]) : null, depth: d };
    if (k === 0) { job.depthDone = d; if (job.onInfo) try { job.onInfo(job.lines[0], job); } catch (_) {} }
  }

  // ================= الأصوات (نفس AudioContext بتاع الموقع عن طريق sfxNotes) =================
  function sound(tier) {
    if (typeof sfxNotes !== "function" || !TIERS[tier]) return;
    const k = TIERS[tier].sound;
    if (k === "brilliant") sfxNotes([1047, 1319, 1568, 2093], 0.07, 0.42, 0.06);       // جرس عبقري طالع
    else if (k === "great") sfxNotes([880, 1175, 1480], 0.06, 0.3, 0.06);
    else if (k === "best") sfxNotes([1760], 0.02, 0.07, 0.08);                          // طقّة نضيفة
    else if (k === "good") sfxNotes([1318], 0.02, 0.06, 0.05);
    else if (k === "inaccuracy") sfxNotes([494, 440], 0.08, 0.2, 0.05);
    else if (k === "mistake") sfxNotes([392, 311], 0.09, 0.22, 0.07);
    else if (k === "missed") sfxNotes([523, 392, 330], 0.08, 0.24, 0.06);
    else if (k === "blunder") sfxNotes([110, 82], 0.05, 0.36, 0.14);                    // خبطة واطية
  }


  // ================= الرسم فوق الرقعة: الشارة ثابتة على مربع النقلة لحد النقلة الجاية =================
  // الشارة بتترسم من الحالة (S.gmBadge / سطر التحليل) بعد كل رسم للرقعة، فرد الخصم وإعادة الرسم ما بيمسحوهاش.
  // الانيميشن بيشتغل أول مرة بس لكل نقلة (مش مع كل تحديث للتقييم) — ده اللي كان مخلّيها «تنط وتختفي».
  const HAS = () => typeof coachSq === "function" && typeof coachArrow === "function";
  GM.gid = 0; GM.badgeN = 0;
  const gid = g => (g ? g.__gmId || (g.__gmId = ++GM.gid) : 0);
  const SEEN = new Set();
  const fresh = k => { if (SEEN.has(k)) return false; if (SEEN.size > 600) SEEN.clear(); SEEN.add(k); return true; };
  function badgeSVG(board, sq, tier, key) {
    const c = coachSq(board, sq), t = TIERS[tier]; if (!c || !t) return "";
    const x = c[0] + 32, y = c[1] - 32;
    return `<g class="eca-gm-sqbadge${fresh(key + "|" + sq + "|" + tier) ? " is-new" : ""}" data-tier="${tier}" data-sq="${H(sq)}"><circle cx="${x}" cy="${y}" r="21" fill="${t.color}" /><text x="${x}" y="${y + 8}" text-anchor="middle">${H(t.sym)}</text></g>`;
  }
  function stateOf(m) { return typeof coachState === "function" ? coachState(m) : null; }
  const btn = (fn, label, cls) => `<button type="button" onclick="${fn}" class="tap ${cls || "eca-gm-analyze"}">${label}</button>`;
  // الشارة والأسهم والملاحظة بتتحط في مكانها، ولو نفس الرسم موجود بالظبط مش بنلمسه (من غير وميض)
  function place(mv, board, svg, above, below) {
    mv.querySelectorAll(".eca-gm-followbar").forEach(e => e.remove());
    if (board) {
      const old = [...board.children].find(e => e.classList && e.classList.contains("eca-gm-svg"));
      if (svg) {
        if (!old || old.__h !== svg) { if (old) old.remove(); board.insertAdjacentHTML("beforeend", `<svg class="eca-gm-svg" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`); board.lastElementChild.__h = svg; }
      } else if (old) old.remove();
      if (above) board.insertAdjacentHTML("beforebegin", above);
      const ob = board.nextElementSibling && board.nextElementSibling.classList.contains("eca-gm-below") ? board.nextElementSibling : null;
      if (below) { if (!ob || ob.__h !== below) { if (ob) ob.remove(); board.insertAdjacentHTML("afterend", `<div class="eca-gm-below">${below}</div>`); board.nextElementSibling.__h = below; } }
      else if (ob) ob.remove();
    } else mv.querySelectorAll(".eca-gm-svg, .eca-gm-below").forEach(e => e.remove());
  }
  function gmPaint() {
    const mv = document.getElementById("mainView");
    if (!mv || !HAS() || typeof arena === "undefined") return;
    const here = typeof tab !== "undefined" && tab === "arena";
    const m = here && typeof coachMode === "function" ? coachMode() : "";
    // تكملة شغالة لوضع مش ظاهر دلوقتي: بتقف والرقعة بترجع
    [arena.puz, arena.boss, arena.ana].forEach(S => { if (S && S.gmFollow && (!m || stateOf(m) !== S)) followStop(S, true); });
    if (!here) return;
    if (arena.sub === "analysis") pump();   // مراجعة الدور بتكمّل لما ترجع لرقعة التحليل
    const board = mv.querySelector(".eca-board"), sub = arena.sub;
    let svg = "", above = "", below = "";
    if (sub === "play" || sub === "pawns") {
      const P = sub === "play" ? arena.play : arena.pawn;
      if (P && P.game) {
        botWatch(P, sub);
        const B = P.gmBadge;
        if (board && B && B.game === P.game) svg += badgeSVG(board, B.sq, B.tier, "bot:" + gid(P.game) + ":" + B.ply);
        if (P.over) below = resultCard(sub, P);
      }
    } else if (m && board) {
      const S = stateOf(m);
      if (S) {
        if (m !== "analysis") snap(S);
        const F = S.gmFollow;
        if (F) {
          board.classList.add("eca-coach-lock");
          F.arrows.forEach((a, i) => {
            const p = coachSq(board, a.from), q = coachSq(board, a.to); if (!p || !q) return;
            const col = a.mine ? "#81B64C" : "#CA3431";
            svg += coachArrow(p, q, (a.mine ? "eca-gm-mine" : "eca-gm-opp") + (i === F.arrows.length - 1 ? "" : "-old"), col);
            svg += `<g class="eca-gm-num"><circle cx="${(p[0] + q[0]) / 2}" cy="${(p[1] + q[1]) / 2}" r="19" fill="${col}" /><text x="${(p[0] + q[0]) / 2}" y="${(p[1] + q[1]) / 2 + 7}" text-anchor="middle">${a.n}</text></g>`;
          });
          above += `<div class="eca-gm-followbar eca-fs-keep" role="status"><b>▶ ${F.title ? H(F.title) + " " : T("التكملة", "Follow-up")} ${F.i}/${F.moves.length}</b><button type="button" onclick="ecaGMFollowStop()" class="tap eca-gm-back">↩ ${T("العودة للموقف", "Back to the position")}</button></div>`;
        } else {
          const B = S.gmBadge;
          if (B && B.game === S.game) {
            // النقلة الغلط بعد ما الرقعة رجعت: سهم باهت مكانها + الشارة، لحد النقلة الجاية
            if (B.ghost && S.game.fen() === B.pre) { const a = coachSq(board, B.ghost.slice(0, 2)), b = coachSq(board, B.ghost.slice(2, 4)); if (a && b) svg += coachArrow(a, b, "eca-gm-ghost", "#CA3431"); }
            svg += badgeSVG(board, B.sq, B.tier, m + ":" + gid(S.game) + ":" + B.n);
          }
          if (m === "analysis") svg += anaArrows(board, S);
          else {
            const card = S.coachPanel && S.coachPanel.game === S.game, N = S.gmNote;
            if (N && N.game === S.game && !card) below += N.html;
            if (!card) below += analyzeBar(S, m);
          }
        }
      }
    }
    place(mv, board, svg, above, below);
  }
  // إعادة الرسم من غير render كامل (مايقطعش سحب قطعة ولا الكتابة في خانة FEN)
  function repaint() { try { gmPaint(); } catch (e) { console.warn("GM overlay:", e); } }
  {
    const _r = render;
    render = function () { const out = _r.apply(this, arguments); try { gmPaint(); } catch (e) { console.warn("GM overlay:", e); } return out; };
  }

  // ================= «▶ وريني التكملة على الرقعة» =================
  function followStart(S, start, moves, mover, title) {
    if (!S || !S.game || !moves || !moves.length) return;
    followStop(S, true);
    const g = S.game;
    if (g.fen() !== start) return;
    const F = S.gmFollow = { start, moves: moves.slice(0, 8), i: 0, arrows: [], last0: S.last, status0: S.status, game: g, mover, title: title || "", timer: 0 };
    if (S !== arena.ana) S.status = "follow";
    S.sel = null;
    const step = () => {
      if (S.gmFollow !== F || S.game !== g) return;
      if (F.i >= F.moves.length) return;
      const u = F.moves[F.i]; let r = null;
      try { r = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined }); } catch (_) {}
      if (!r) { F.moves = F.moves.slice(0, F.i); if (typeof arenaRefresh === "function") arenaRefresh(); return; }
      F.i++; F.arrows.push({ from: r.from, to: r.to, n: F.i, mine: r.color === F.mover });
      S.last = [r.from, r.to];
      if (typeof sfxNotes === "function") sfxNotes([r.captured ? 330 : 523], 0.02, 0.06, 0.04);
      if (typeof arenaRefresh === "function") arenaRefresh();
      if (F.i < F.moves.length) F.timer = setTimeout(step, 1050);
    };
    F.timer = setTimeout(step, 250);
    if (typeof arenaRefresh === "function") arenaRefresh();
  }
  function followStop(S, quiet) {
    const F = S && S.gmFollow; if (!F) return;
    clearTimeout(F.timer); S.gmFollow = null;
    if (S.game === F.game) {
      for (let k = 0; k < F.i; k++) F.game.undo();
      if (F.game.fen() !== F.start) { try { F.game.load(F.start); } catch (_) {} }
    }
    S.last = F.last0; S.sel = null;
    if (S.status === "follow") S.status = F.status0 === "follow" ? "play" : F.status0;
    if (S === arena.ana && typeof anaGo === "function") anaGo(arena.ana.ply, true);
    if (!quiet && typeof arenaRefresh === "function") arenaRefresh();
  }
  function followNow() {
    const m = typeof coachMode === "function" ? coachMode() : ""; const S = m ? stateOf(m) : null;
    if (!S || !S.game) return;
    if (m === "analysis") {
      const mv = S.line && S.line[S.ply - 1], rv = mv && mv.rv;
      if (!rv) return;
      return followStart(S, S.game.fen(), rv.refLine.steps.slice(1).map(s => s.uci), rv.color);
    }
    const rv = (S.coachPanel && S.coachPanel.rv) || null;
    if (!rv) return;
    if (S.isRefuting && typeof coachRestore === "function") coachRestore(S, true);
    if (S.status !== "play" && S.status !== "block") return;
    followStart(S, rv.preFen, rv.refLine.steps.map(s => s.uci), rv.color);
  }
  window.ecaGMFollow = followNow;
  window.ecaGMFollowStop = () => { const m = typeof coachMode === "function" ? coachMode() : ""; const S = m ? stateOf(m) : null; if (S) followStop(S, false); };

  // ================= الألغاز: لقطة اللغز (للتحليل)، شارة كل نقلة، وكارت النقلة الغلط =================
  const uciOf = (fen, mv) => { try { const c = new ChessCls(fen), r = c.move(mv); return r ? r.from + r.to + (r.promotion || "") : ""; } catch (_) { return ""; } };
  const huci = m => m.from + m.to + (m.promotion || "");
  // أول ما لغز جديد يظهر: نحفظ الموقف اللي الطالب بيبدأ منه (والحل في الذاكرة بس، عشان «حلّل في رقعة التحليل» بعد ما يخلص)
  function snap(S) {
    if (!S || !S.game || S.gmSnapGame === S.game) return;
    if (S.gmSnapGame) { const p = snapOf(S, true); if (p && p.moves.length) S.gmPrevSnap = p; }
    S.gmSnapGame = S.game; S.gmStartPly = S.game.history().length; S.gmStartFen = S.game.fen();
    S.gmWrongUci = ""; S.gmWrongPre = ""; S.gmFailed = false; S.gmSolution = (S.sol || []).slice(S.idx || 0);
  }
  function snapOf(S, old) {
    const g = S && S.gmSnapGame; if (!g) return null;
    const moves = g.history({ verbose: true }).slice(S.gmStartPly || 0).map(huci);
    if (S.gmWrongUci && g.fen() === S.gmWrongPre) moves.push(S.gmWrongUci);
    return { fen: S.gmStartFen, moves, solution: (S.gmSolution || []).slice(), done: !!old || S.gmFailed || ["solved", "shown", "hit", "won"].includes(S.status) };
  }
  function analyzeBar(S, m) {
    if (!S.game) return "";
    if (S.gmSnapGame === S.game && (S.gmFailed || ["solved", "shown", "hit"].includes(S.status))) return btn("ecaAnalyzeFrom('cur')", T("🔬 افتح اللغز في رقعة التحليل (Analyze Position)", "🔬 Open this puzzle on the analysis board"));
    if (S.gmPrevSnap) return btn("ecaAnalyzeFrom('prev')", T("🔬 حلّل اللغز اللي فات في رقعة التحليل", "🔬 Analyze the previous puzzle"));
    return "";
  }
  function noteHTML(tier, text, key) {
    const t = TIERS[tier];
    return `<div class="eca-gm-note${fresh("note|" + key + "|" + tier) ? " is-new" : ""}" data-tier="${tier}" style="--gm:${t.color}" role="status"><span class="eca-gm-badge" aria-hidden="true">${t.sym}</span><p><b>${H(t.sym + " " + tierName(tier))}</b> — ${text}</p></div>`;
  }
  // نقلة صح في لغز: «★ أفضل نقلة» على طول، والمحرك (MultiPV 3) بيرقّيها لـ !! لو تضحية هي الوحيدة، أو ! لو نقلة وحيدة حاسمة
  function puzzleGood(S, pre, u) {
    if (!u || !S.game) return;
    const g = S.game, PCA = root.PositionConceptAnalyzer, sac = PCA.sacrifice(pre, u), w = PCA.walkLine(pre, [u]).steps[0];
    if (!w) return;
    const n = ++GM.badgeN, own = w.concepts.map(conceptText).filter(Boolean)[0];
    const show = tier => {
      if (S.game !== g || (S.gmBadge && S.gmBadge.n !== n)) return;
      S.gmBadge = { game: g, sq: w.to, tier, n };
      const txt = tier === "BRILLIANT" ? T(`تضحية: ${P(w.piece)} في ${SQ(w.to)} ممكن يتاكل، وده بالظبط اللي بيكسب — ومفيش نقلة تانية بتعمل كده!`, `a sacrifice: ${P(w.piece)} on ${SQ(w.to)} can be taken, and that's exactly what wins — nothing else does!`)
        : tier === "GREAT" ? T("النقلة الوحيدة اللي بتقلب الموقف هنا!", "the only move that turns the game here!") : (own || T(`${P(w.piece)} لـ ${SQ(w.to)} هي النقلة الصح.`, `${P(w.piece)} to ${SQ(w.to)} is the right move.`));
      S.gmNote = { game: g, html: noteHTML(tier, txt, gid(g) + ":" + n) };
      repaint();
    };
    S.gmBadge = { game: g, sq: w.to, tier: "BEST", n };
    show("BEST"); sound("BEST");
    const flags = { routine: !!sac.routineCapture, mateNow: !!w.mate, development: w.concepts.some(c => c.key === "development"), quiet: !sac.capture && !sac.check };
    internal(pre, { multiPV: 3, maxNodes: 90000, budget: 1500 }).then(r => {
      if (!r || !r.lines.length || S.game !== g || !S.gmBadge || S.gmBadge.n !== n) return;
      const sol = r.lines.find(l => l.uci === u) || r.lines[0], second = r.lines.find(l => l.uci !== u) || null;
      const c = classify(Object.assign({ isBest: true, puzzle: true, sacrifice: sac.is, best: sol, second, after: sol }, flags));
      if (c.tier !== "BEST") { show(c.tier); sound(c.tier); }
    });
  }
  // نقلة غلط في (الدروس، الدوجو، الزعيم): الكارت بيتكتب من الحكم المبدئي، والمحرك بيكمّله في ثواني
  function puzzleWrong(S, R) {
    if (!S || !R || !R.wrongUci) return;
    const g = S.game, idx = S.idx, wrong = R.wrongUci, post = fenAfter(R.pre, wrong), n = ++GM.badgeN;
    snap(S); S.gmWrongUci = wrong; S.gmWrongPre = R.pre; S.gmFailed = true;
    const diagHTML = R.diag && root.CoachKnowledgeBot ? root.CoachKnowledgeBot.diagnosis(R.diag) : "";
    const shown = R.ref ? R.ref.from + R.ref.to + (R.ref.promotion || "") : "";
    const tok = S.gmTok = (S.gmTok || 0) + 1;
    const analyzeBtn = btn("ecaAnalyzeFrom('cur')", T("🔬 افتح في رقعة التحليل (Analyze Position)", "🔬 Open on the analysis board"));
    Promise.all([internal(R.pre, { multiPV: 1, maxNodes: 100000, budget: 2000 }), internal(post, { multiPV: 1, maxNodes: 100000, budget: 2000 })]).then(async ([pre, aft]) => {
      if (S.gmTok !== tok || S.game !== g || !pre) return;
      let refPv = aft && aft.lines[0] ? aft.lines[0].pv : [];
      // الخط لازم يبدأ بالرد اللي اتلعب على الرقعة فعلاً
      if (shown && refPv[0] !== shown) { const r2 = await internal(fenAfter(post, shown), { multiPV: 1, maxNodes: 80000, budget: 1500 }); refPv = [shown].concat(r2 && r2.lines[0] ? r2.lines[0].pv : []); }
      if (S.gmTok !== tok || S.game !== g) return;
      let rv = null;
      try { rv = review({ preFen: R.pre, uci: wrong, pre, post: aft, puzzle: true, isBest: false, hideBest: true, refPv, themes: R.themes, diag: R.diag }); }
      catch (e) { console.warn("GM review:", e); return; }   // الشرح المبدئي بيفضل، من غير ما يقع حاجة
      // الشرح القديم (نوع الغلطة) بيفضل بس لو الحساب العميق متفق معاه على الخسارة
      const keepDiag = diagHTML && (R.diag.type === "MISSED_TACTICAL_WIN" || R.diag.type === "WALKED_INTO_MATE" || rv.refLine.net <= -70 || rv.refLine.mate);
      S.coachPanel = { game: g, idx, rv, html: cardHTML(rv, { close: true, keep: true, diagHTML: keepDiag ? diagHTML : "", extra: analyzeBtn }) };
      S.gmBadge = { game: g, sq: wrong.slice(2, 4), tier: rv.tier, n, ghost: wrong, pre: R.pre };
      if (typeof arenaRefresh === "function" && !S.gmFollow) arenaRefresh();
    });
    // لحد ما المحرك يخلص: الحكم المبدئي من نوع الغلطة
    S.coachPanel = { game: g, idx, rv: null, html: `<section class="eca-coach-panel eca-gm-card eca-fs-keep" data-tier="" aria-label="${T("شرح الكوتش", "Coach explanation")}"><header><span class="eca-gm-badge" aria-hidden="true">⏳</span><span class="eca-gm-head"><b class="eca-gm-title">${T("الكوتش بيحسب التكملة...", "The coach is calculating...")}</b></span><button type="button" onclick="coachPanelClose()" class="tap eca-coach-x" title="${T("اقفل الشرح", "Close")}" aria-label="${T("اقفل الشرح", "Close")}">✕</button></header><div class="eca-gm-layer" data-layer="1"><h4>1. ${T("الحكم المباشر", "The verdict")}</h4><p class="eca-gm-diag">${diagHTML || T("النقلة دي مش الأحسن هنا.", "This isn't the best move here.")}</p></div></section>` };
  }
  // نقلة غلط في ألغاز التدريب العادية (من غير رد عقابي): الشارة بس، وبتفضل لحد النقلة الجاية
  function puzzleWrongBadge(S, pre, u) {
    const g = S.game, n = ++GM.badgeN, post = fenAfter(pre, u);
    S.gmWrongUci = u; S.gmWrongPre = pre; S.gmFailed = true;
    Promise.all([internal(pre, { multiPV: 1, maxNodes: 60000, budget: 1500 }), internal(post, { multiPV: 1, maxNodes: 60000, budget: 1500 })]).then(([a, b]) => {
      if (S.game !== g || (S.gmBadge && S.gmBadge.n > n) || !a) return;
      let rv = null; try { rv = review({ preFen: pre, uci: u, pre: a, post: b, puzzle: true, isBest: false, hideBest: true }); } catch (_) { return; }
      S.gmBadge = { game: g, sq: u.slice(2, 4), tier: rv.tier, n, ghost: u, pre };
      repaint();
    });
  }
  {
    const _pp = puzPlay;
    puzPlay = function (mv) {
      const Z = arena.puz, m = typeof coachMode === "function" ? coachMode() : "", g = Z.game, st = Z.status, idx = Z.idx, pre = g ? g.fen() : "";
      if (st === "play") { snap(Z); Z.gmNote = null; Z.gmBadge = null; }
      const out = _pp.apply(this, arguments);
      try {
        if (st === "play" && g && Z.game === g && m && typeof coachHintOk === "function" && coachHintOk(m)) {
          if (Z.idx > idx || Z.status === "solved") puzzleGood(Z, pre, uciOf(pre, mv));
          else if (Z.status === "wrong" && !Z.isRefuting) puzzleWrongBadge(Z, pre, uciOf(pre, mv));
        }
      } catch (e) { console.warn("GM puzzle:", e); }
      return out;
    };
    window.puzPlay = puzPlay;
    const _pl = puzLoad;
    puzLoad = function () { const Z = arena.puz; if (Z.gmFollow) followStop(Z, true); Z.gmNote = null; Z.gmBadge = null; return _pl.apply(this, arguments); };
    const _bm = bossMove;
    bossMove = function (mv) {
      const B = arena.boss, g = B.game, st = B.status, idx = B.idx, pre = g ? g.fen() : "";
      if (st === "play") { snap(B); B.gmNote = null; B.gmBadge = null; }
      const out = _bm.apply(this, arguments);
      try { if (st === "play" && g && B.game === g && (B.idx > idx || B.status === "hit")) puzzleGood(B, pre, uciOf(pre, mv)); } catch (e) { console.warn("GM boss:", e); }
      return out;
    };
  }

  // ================= «🔬 افتح في رقعة التحليل»: اللغز كله (البداية + اللي اتلعب + الحل) =================
  function analyzeFrom(which) {
    if (typeof anaLoadLine !== "function") return;
    const sub = arena.sub; let S = null, sn = null, m = "";
    if (sub === "weekly") { S = arena.weekly; sn = S && S.gmLastSnap; }
    else {
      m = typeof coachMode === "function" ? coachMode() : ""; S = m ? stateOf(m) : null;
      if (!S) return;
      if (S.isRefuting && typeof coachRestore === "function") coachRestore(S, true);
      if (S.gmFollow) followStop(S, true);
      sn = which === "prev" ? S.gmPrevSnap : snapOf(S);
      // لغز لسه ما اتحلش: فتحه في التحليل = استخدام المساعدة كلها (الجايزة ×0.5، وضربة الزعيم كمان)
      if (which !== "prev" && sn && S.game && !["solved", "shown", "hit"].includes(S.status)) {
        S.coachKey = S.game; S.coachStage = 3;
        if (m === "boss" && S.aid) { S.coachWorst = S.coachWorst || {}; S.coachWorst[S.aid] = 3; }
      }
    }
    if (!sn) return;
    const Z = arena.puz;
    const label = sub === "weekly" ? T("🎯 تحدي الكوتش الأسبوعي", "🎯 Coach's weekly challenge") : m === "boss" ? T("🐉 لغز الزعيم", "🐉 Boss puzzle") : m === "dojo" ? T("🥋 لغز من الدوجو", "🥋 Dojo puzzle")
      : Z.lesson ? T("🗺️ لغز من مغامرة الدروس", "🗺️ Adventure lesson puzzle") : Z.diff === "daily" ? T("📅 لغز اليوم", "📅 Daily puzzle") : T("🧩 لغز التدريب", "🧩 Practice puzzle");
    anaLoadLine(sn.fen, sn.moves, { ply: sn.moves.length, flip: String(sn.fen).split(" ")[1] === "b", solution: sn.solution,
      from: { sub, label, back: T("↩ العودة للتدريب", "↩ Back to training") } });
    arenaSub("analysis");
  }
  window.ecaAnalyzeFrom = analyzeFrom;
  // تحدي الأسبوع: اللقطة بعد كل نقلة، والزرار بيظهر بس بعد الحل أو لما المحاولات تخلص (عشان مايكشفش الحل لمحاولة جاية)
  if (typeof wkMove === "function") {
    const _wk = wkMove;
    wkMove = function (mv) { const W = arena.weekly; snap(W); const out = _wk.apply(this, arguments); try { W.gmLastSnap = snapOf(W); } catch (_) {} return out; };
    window.wkMove = wkMove;
  }
  if (typeof arenaWeeklyHTML === "function") {
    const _aw = arenaWeeklyHTML;
    arenaWeeklyHTML = function () {
      const h = _aw.apply(this, arguments), W = arena.weekly, u = typeof currUser === "function" ? currUser() : null;
      if (!W || !W.gmLastSnap || !u || u.role === "coach" || ["play", "wrong", "saving"].includes(W.status)) return h;
      const att = W.att || {}, left = Math.max(0, (typeof WK_ATTEMPTS !== "undefined" ? WK_ATTEMPTS : 2) - (Number(att.n) || 0));
      if (!(att.solved || !left)) return h;
      return `<div class="max-w-xl w-full mx-auto mb-4">${btn("ecaAnalyzeFrom('weekly')", T("🔬 افتح التحدي في رقعة التحليل (Analyze Position)", "🔬 Open the challenge on the analysis board"), "eca-gm-analyze w-full")}</div>` + h;
    };
  }

  // ================= الأدوار ضد البوت: شارة لكل نقلة ليك + «📊 تحليل الدور مع الجراند ماستر» =================
  function botWatch(P, sub) {
    const g = P.game; if (!g) return;
    if (P.gmGame !== g) { P.gmGame = g; P.gmCls = {}; P.gmPend = {}; P.gmBadge = null; }
    const h = g.history({ verbose: true });
    Object.keys(P.gmCls).forEach(i => { if (+i >= h.length || P.gmCls[i].uci !== huci(h[+i])) delete P.gmCls[i]; });   // تراجع
    let last = -1; for (let i = h.length - 1; i >= 0; i--) if (h[i].color === P.color) { last = i; break; }
    if (P.gmBadge && P.gmBadge.ply !== last) P.gmBadge = null;   // نقلة جديدة ليك: الشارة القديمة بتمشي
    if (!P.gmBadge && last >= 0 && P.gmCls[last]) P.gmBadge = { game: g, sq: h[last].to, tier: P.gmCls[last].tier, ply: last };
    for (let i = 0; i < h.length; i++) if (h[i].color === P.color && !P.gmCls[i] && !P.gmPend[i]) { P.gmPend[i] = true; classifyPly(P, g, h, i, sub); }
  }
  function classifyPly(P, g, h, i, sub) {
    const m = h[i], u = huci(m), ply = i + 1;
    const done = (pre, post) => {
      delete P.gmPend[i];
      if (P.game !== g) return;
      const hh = g.history({ verbose: true }); if (!hh[i] || huci(hh[i]) !== u) return;
      let rv = null;
      try { rv = review({ preFen: m.before, uci: u, pre: pre || { lines: [] }, post: post || { lines: [] }, ply, prevFen: i ? h[i - 1].before : null, prevUci: i ? huci(h[i - 1]) : null }); } catch (e) { console.warn("GM bot review:", e); return; }
      P.gmCls[i] = rv;
      let last = -1; for (let k = hh.length - 1; k >= 0; k--) if (hh[k].color === P.color) { last = k; break; }
      if (i === last) { P.gmBadge = { game: g, sq: m.to, tier: rv.tier, ply: i }; if (["BRILLIANT", "GREAT", "MISTAKE", "MISSED_WIN", "BLUNDER"].includes(rv.tier)) sound(rv.tier); }
      const el = document.querySelector("#mainView [data-gm-moves]");
      if (el && typeof tab !== "undefined" && tab === "arena" && arena.sub === sub) el.outerHTML = movesListHTML(g);
      repaint();
    };
    if (ply <= 12 && root.EcaOpeningBook && EcaOpeningBook.lookup(m.after)) return done(null, null);   // كتاب: من غير محرك
    Promise.all([analyze(m.before, { multiPV: 3, depth: 12, movetime: 700, prio: 1 }), analyze(m.after, { multiPV: 1, depth: 12, movetime: 600, prio: 1 })]).then(([a, b]) => done(a, b));
  }
  {
    const _ml = movesListHTML;
    movesListHTML = function (g) {
      const P = g && arena.play && arena.play.game === g ? arena.play : g && arena.pawn && arena.pawn.game === g ? arena.pawn : null;
      if (!P) return _ml.apply(this, arguments);
      const h = g.history(), cls = (P.gmGame === g && P.gmCls) || {};
      const cell = j => {
        if (j >= h.length) return `<span class="eca-mv-cell"></span>`;
        const rv = cls[j], t = rv && TIERS[rv.tier];
        return `<span class="eca-mv-cell"${t ? ` data-tier="${rv.tier}"` : ""}>${t ? `<span class="eca-gm-mini" style="--gm:${t.color}" title="${H(tierName(rv.tier))}">${t.sym}</span>` : ""}${H(h[j])}</span>`;
      };
      let rows = "";
      for (let i = 0; i < h.length; i += 2) rows += `<div class="flex gap-3 px-3 py-1 ${i % 4 === 0 ? "bg-black/40" : ""}"><span class="w-6 text-gray-500">${i / 2 + 1}.</span>${cell(i)}${cell(i + 1)}</div>`;
      return `<div data-gm-moves dir="ltr" class="text-xs font-mono max-h-56 overflow-y-auto rounded-xl border border-yellow-500/15">${rows || `<div class="p-3 text-center text-gray-500">—</div>`}</div>`;
    };
  }
  const reviewLabel = () => `📊 ${T("تحليل الدور مع الجراند ماستر", "Game Review with the Grandmaster")} <span dir="ltr">(Game Review)</span>`;
  function resultCard(sub, P) {
    const res = P.over === "win" ? T("🏆 كسبت الدور!", "🏆 You won!") : P.over === "loss" ? T("💔 خسرت الدور", "💔 You lost") : T("🤝 الدور انتهى بالتعادل", "🤝 Draw");
    return `<div class="eca-gm-result" role="status"><b>${res}</b><p>${T("شوف كل نقلة: دقتك، أخطاءك، وأحسن نقلة في كل لحظة مهمة.", "See every move: your accuracy, your mistakes and the best move at each key moment.")}</p>${btn(`ecaGameReview('${sub === "pawns" ? "pawns" : "play"}')`, reviewLabel(), "eca-gm-cta")}</div>`;
  }
  function gameReview(src) {
    const P = src === "pawns" ? arena.pawn : arena.play;
    if (!P || !P.game || typeof anaLoadLine !== "function") return;
    const h = P.game.history({ verbose: true }), rootFen = h.length ? h[0].before : P.game.fen();
    const bot = src === "pawns" ? T("الكمبيوتر", "the computer") : ((typeof LEVELS !== "undefined" && LEVELS[P.level]) || {}).name || "Bot";
    anaLoadLine(rootFen, h.map(huci), { ply: 0, flip: P.color === "b", review: { side: P.color, bot },
      from: { sub: src, label: T(`📊 مراجعة دورك ضد ${bot}`, `📊 Review of your game vs ${bot}`), back: T("↩ العودة للدور", "↩ Back to the game") } });
    arenaSub("analysis");
  }
  window.ecaGameReview = gameReview;
  // زرار المراجعة في لوحة التحكم بعد ما الدور يخلص
  if (typeof arenaPlayHTML === "function") {
    const _ap = arenaPlayHTML;
    arenaPlayHTML = function () {
      const h = _ap.apply(this, arguments), P = arena.play;
      if (!P.game || !P.over) return h;
      return h.replace('<div class="grid grid-cols-3 gap-2">', `${btn("ecaGameReview('play')", reviewLabel(), "eca-gm-cta w-full")}<div class="grid grid-cols-3 gap-2">`);
    };
  }
  if (typeof arenaPawnsHTML === "function") {
    const _apw = arenaPawnsHTML;
    arenaPawnsHTML = function () {
      const h = _apw.apply(this, arguments), P = arena.pawn;
      if (!P.game || !P.over) return h;
      return h.replace('<button onclick="pawnReset()"', `${btn("ecaGameReview('pawns')", reviewLabel(), "eca-gm-cta w-full col-span-2")}<button onclick="pawnReset()"`);
    };
  }

  // ================= رقعة التحليل: الأسهم (أخضر = الأفضل، أحمر = رد الخصم/التهديد) والشارة =================
  function anaArrows(board, A) {
    if (!A.game) return "";
    let svg = "";
    const mv = A.line && A.line[A.ply - 1], rv = mv && mv.rv, cur = get(A.game.fen());
    if (A.showLines !== false && !A.retry) {
      const bad = rv && !GOOD_TIERS.includes(rv.tier);
      const green = bad ? rv.bestUci : cur && cur.lines && cur.lines[0] ? cur.lines[0].uci : "";
      const red = bad ? rv.refUci : "";
      const arrow = (u, cls, col) => { if (!u) return ""; const a = coachSq(board, u.slice(0, 2)), b = coachSq(board, u.slice(2, 4)); return a && b ? coachArrow(a, b, cls, col) : ""; };
      svg += arrow(green, "eca-gm-best", "#81B64C");
      svg += arrow(red, "eca-gm-threat", "#CA3431");
    }
    if (rv && mv) svg += badgeSVG(board, mv.uci.slice(2, 4), rv.tier, "ana:" + A.ply + ":" + mv.uci);
    return svg;
  }

  window.ecaGM = { internal, analyze, store, get, review, classify, accuracy, cardHTML, sound, repaint, follow: followNow, followStart, followStop, tiers: TIERS, tier: k => TIERS[k] || null,
    puzzleWrong, puzzleGood, snapOf, analyzeFrom, gameReview, botWatch,
    get engine() { return GM.engine; }, set engine(v) { GM.engine = v; }, get sfReady() { return !!SF.w && !SF.dead; }, cache: GM.cache,
    queue: () => ({ running: SF.job ? { prio: SF.job.prio, fen: SF.job.fen } : null, waiting: SF.q.map(j => j.prio), engine: useInternal() ? "eca" : "sf" }) };
})(typeof window !== "undefined" ? window : globalThis);
