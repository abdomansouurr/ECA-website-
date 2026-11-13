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
  // التصنيف: o = { book, isBest, puzzle, sacrifice, best, second, after } والتقييمات كلها من ناحية اللي لعب
  function classify(o) {
    const bc = evCp(o.best), ac = evCp(o.after), sc = o.second ? evCp(o.second) : null;
    const wb = winPct(bc), wa = winPct(ac), loss = Math.max(0, wb - wa), cpLoss = Math.max(0, bc - ac);
    const out = tier => ({ tier, winBefore: Math.round(wb * 10) / 10, winAfter: Math.round(wa * 10) / 10, winLoss: Math.round(loss * 10) / 10, cpLoss, bestCp: bc, afterCp: ac, secondCp: sc });
    if (o.book) return out("BOOK");
    const bestMate = !!(o.best && o.best.mate > 0);
    if (o.isBest) {
      const saves = sc != null && sc <= -200 && ac >= -50;
      // عبقرية: تضحية (SEE) وهي أحسن نقلة، وبتكسب أو بتنقذ موقف خسران، والبدايل من غير التضحية أضعف بوضوح
      if (o.sacrifice && (bestMate || saves || (ac >= 150 && (sc == null || bc - sc >= 100)))) return out("BRILLIANT");
      // عظيمة: النقلة الوحيدة (الفرق عن تاني أحسن نقلة 200 سنتي وأكتر وبيفرق في نسبة المكسب)، أو بتقلب الخسارة
      if (sc != null && ((bc - sc >= 200 && winPct(bc) - winPct(sc) >= 15) || saves)) return out("GREAT");
      return out("BEST");
    }
    if (o.after && o.after.mate != null && o.after.mate < 0 && !(o.best && o.best.mate != null && o.best.mate < 0)) return out("BLUNDER");   // دخل في مات
    // فرصة فوز ضائعة: كان في ضربة قاضية (مات أو تكتيك بيكسب خامات) والنقلة هادية ما خسرتش حاجة بنفسها لكن ضيّعت المكسب.
    // لو النقلة نفسها بتخسر قطعة (lossCp) يبقى ده خطأ فادح مش «فرصة ضائعة»
    if ((bc >= 300 || bestMate) && ac < 300 && ac > -200 && loss >= 10 && !(o.lossCp <= -200) && o.tacticalWin !== false) return out("MISSED_WIN");
    if (loss > 20 || (cpLoss >= 250 && ac <= 150)) return out("BLUNDER");
    if (loss > 10) return out("MISTAKE");
    if (loss > 5 || o.puzzle) return out("INACCURACY");
    if (loss > 2) return out("GOOD");
    return out("EXCELLENT");
  }

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
    const after = over === "mate" ? { cp: null, mate: 1 } : over === "stalemate" ? { cp: 0, mate: null } : o.post && o.post.lines && o.post.lines[0] ? flipEv(o.post.lines[0]) : best ? { cp: best.cp, mate: best.mate } : { cp: 0, mate: null };
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
    const cls = classify({ book: !!book, isBest, puzzle: !!o.puzzle, sacrifice: sac.is, best: best || after, second, after, lossCp: refLine.net, tacticalWin: isBest ? true : tacticalWin });
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
      <div class="eca-gm-layer" data-layer="4">${followBtn}</div>
      <p class="eca-gm-rule">🧭 ${rv.text.rule}</p>
    </section>`;
  }
  root.GrandmasterMoveClassifier = { TIERS, ORDER: Object.keys(TIERS), winPct, evCp, flipEv, classify, review, cardHTML, evalText, conceptText, tierName, sanList };
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

  // ================= الرسم فوق الرقعة: شارة المربع، أسهم التحليل، خطوات التكملة =================
  const HAS = () => typeof coachSq === "function" && typeof coachArrow === "function";
  function badgeSVG(board, sq, tier) {
    const c = coachSq(board, sq), t = TIERS[tier]; if (!c || !t) return "";
    const x = c[0] + 32, y = c[1] - 32;
    return `<g class="eca-gm-sqbadge" data-tier="${tier}"><circle cx="${x}" cy="${y}" r="21" fill="${t.color}" /><text x="${x}" y="${y + 8}" text-anchor="middle">${H(t.sym)}</text></g>`;
  }
  function stateOf(m) { return typeof coachState === "function" ? coachState(m) : null; }
  function gmPaint() {
    const mv = document.getElementById("mainView");
    if (!mv || !HAS()) return;
    const m = typeof coachMode === "function" ? coachMode() : "";
    // تكملة شغالة لوضع مش ظاهر دلوقتي: بتقف والرقعة بترجع
    [arena.puz, arena.boss, arena.ana].forEach(S => { if (S && S.gmFollow && (!m || stateOf(m) !== S)) followStop(S, true); });
    if (!m) return;
    const S = stateOf(m), board = mv.querySelector(".eca-board");
    if (!S || !board) return;
    let svg = "", above = "", below = "";
    const F = S.gmFollow;
    if (F) {
      board.classList.add("eca-coach-lock");
      F.arrows.forEach((a, i) => {
        const p = coachSq(board, a.from), q = coachSq(board, a.to); if (!p || !q) return;
        const col = a.mine ? "#81B64C" : "#CA3431";
        svg += coachArrow(p, q, (a.mine ? "eca-gm-mine" : "eca-gm-opp") + (i === F.arrows.length - 1 ? "" : "-old"), col);
        svg += `<g class="eca-gm-num"><circle cx="${(p[0] + q[0]) / 2}" cy="${(p[1] + q[1]) / 2}" r="19" fill="${col}" /><text x="${(p[0] + q[0]) / 2}" y="${(p[1] + q[1]) / 2 + 7}" text-anchor="middle">${a.n}</text></g>`;
      });
      above += `<div class="eca-gm-followbar eca-fs-keep" role="status"><b>▶ ${T("التكملة", "Follow-up")} ${F.i}/${F.moves.length}</b><button type="button" onclick="ecaGMFollowStop()" class="tap eca-gm-back">↩ ${T("العودة للموقف", "Back to the position")}</button></div>`;
    } else {
      const B = S.gmBadge;
      if (B && B.game === S.game && (!B.fen || (S.game && S.game.fen() === B.fen) || B.keep)) svg += badgeSVG(board, B.sq, B.tier);
      if (m === "analysis") svg += anaArrows(board, S);
      const N = S.gmNote;
      if (N && N.game === S.game && !(S.coachPanel && S.coachPanel.game === S.game)) below = N.html;
    }
    if (svg) board.insertAdjacentHTML("beforeend", `<svg class="eca-gm-svg" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`);
    if (above) board.insertAdjacentHTML("beforebegin", above);
    if (below) board.insertAdjacentHTML("afterend", below);
  }
  // إعادة رسم الشارة والأسهم بس (من غير render كامل: مايقطعش سحب قطعة ولا الكتابة في خانة FEN)
  function repaint() {
    const mv = document.getElementById("mainView"); if (!mv) return;
    mv.querySelectorAll(".eca-gm-svg, .eca-gm-followbar, .eca-gm-note").forEach(e => e.remove());
    try { gmPaint(); } catch (e) { console.warn("GM overlay:", e); }
  }
  {
    const _r = render;
    render = function () { const out = _r.apply(this, arguments); try { gmPaint(); } catch (e) { console.warn("GM overlay:", e); } return out; };
  }

  // ================= «▶ وريني التكملة على الرقعة» =================
  function followStart(S, start, moves, mover) {
    if (!S || !S.game || !moves || !moves.length) return;
    followStop(S, true);
    const g = S.game;
    if (g.fen() !== start) return;
    const F = S.gmFollow = { start, moves: moves.slice(0, 6), i: 0, arrows: [], last0: S.last, status0: S.status, game: g, mover, timer: 0 };
    if (S !== arena.ana) S.status = "follow";
    S.sel = null; S.gmNote = null;
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

  // ================= الألغاز: شارة لكل نقلة صح + كارت كامل للنقلة الغلط =================
  const uciOf = (fen, mv) => { try { const c = new ChessCls(fen), r = c.move(mv); return r ? r.from + r.to + (r.promotion || "") : ""; } catch (_) { return ""; } };
  function noteHTML(tier, text) {
    const t = TIERS[tier];
    return `<div class="eca-gm-note eca-fs-keep" data-tier="${tier}" style="--gm:${t.color}" role="status"><span class="eca-gm-badge" aria-hidden="true">${t.sym}</span><p><b>${H(t.sym + " " + tierName(tier))}</b> — ${text}</p></div>`;
  }
  // نقلة صح في لغز: أفضل نقلة (★)، أو عبقرية (!!) لو تضحية، أو عظيمة (!) لو هي الوحيدة (المحرك بيتأكد في الخلفية)
  function puzzleGood(S, pre, u) {
    if (!u || !S.game) return;
    const g = S.game, PCA = root.PositionConceptAnalyzer, sac = PCA.sacrifice(pre, u), w = PCA.walkLine(pre, [u]).steps[0];
    if (!w) return;
    const own = w.concepts.map(conceptText).filter(Boolean)[0];
    const show = tier => {
      if (S.game !== g) return;
      S.gmBadge = { game: g, sq: w.to, tier, keep: true };
      const txt = tier === "BRILLIANT" ? T(`تضحية: ${P(w.piece)} في ${SQ(w.to)} ممكن يتاكل، وده بالظبط اللي بيكسب!`, `a sacrifice: ${P(w.piece)} on ${SQ(w.to)} can be taken, and that's exactly what wins!`)
        : tier === "GREAT" ? T("النقلة الوحيدة اللي بتكسب في الموقف ده!", "the only winning move here!") : (own || T(`${P(w.piece)} لـ ${SQ(w.to)} هي النقلة الصح.`, `${P(w.piece)} to ${SQ(w.to)} is the right move.`));
      S.gmNote = { game: g, html: noteHTML(tier, txt) };
      repaint();
    };
    const first = sac.is ? "BRILLIANT" : "BEST";
    show(first); sound(first);
    if (first === "BEST") internal(pre, { multiPV: 2, maxNodes: 60000, budget: 1500 }).then(r => {
      if (!r || S.game !== g || !S.gmBadge || S.gmBadge.tier !== "BEST") return;
      const c = classify({ isBest: true, puzzle: true, sacrifice: false, best: r.lines[0], second: r.lines[1] || null, after: r.lines[0] });
      if (c.tier === "GREAT") { show("GREAT"); sound("GREAT"); }
    });
  }
  // نقلة غلط في (الدروس، الدوجو، الزعيم): الكارت بيتكتب من الحكم المبدئي، والمحرك بيكمّله في ثواني
  function puzzleWrong(S, R) {
    if (!S || !R || !R.wrongUci) return;
    const g = S.game, idx = S.idx, wrong = R.wrongUci, post = fenAfter(R.pre, wrong);
    const diagHTML = R.diag && root.CoachKnowledgeBot ? root.CoachKnowledgeBot.diagnosis(R.diag) : "";
    const shown = R.ref ? R.ref.from + R.ref.to + (R.ref.promotion || "") : "";
    const tok = S.gmTok = (S.gmTok || 0) + 1;
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
      S.coachPanel = { game: g, idx, rv, html: cardHTML(rv, { close: true, keep: true, diagHTML: keepDiag ? diagHTML : "" }) };
      S.gmBadge = { game: g, sq: wrong.slice(2, 4), tier: rv.tier, fen: post };
      if (typeof arenaRefresh === "function" && !S.gmFollow) arenaRefresh();
    });
    // لحد ما المحرك يخلص: الحكم المبدئي من نوع الغلطة
    S.coachPanel = { game: g, idx, rv: null, html: `<section class="eca-coach-panel eca-gm-card eca-fs-keep" data-tier="" aria-label="${T("شرح الكوتش", "Coach explanation")}"><header><span class="eca-gm-badge" aria-hidden="true">⏳</span><span class="eca-gm-head"><b class="eca-gm-title">${T("الكوتش بيحسب التكملة...", "The coach is calculating...")}</b></span><button type="button" onclick="coachPanelClose()" class="tap eca-coach-x" title="${T("اقفل الشرح", "Close")}" aria-label="${T("اقفل الشرح", "Close")}">✕</button></header><div class="eca-gm-layer" data-layer="1"><h4>1. ${T("الحكم المباشر", "The verdict")}</h4><p class="eca-gm-diag">${diagHTML || T("النقلة دي مش الأحسن هنا.", "This isn't the best move here.")}</p></div></section>` };
  }
  {
    const _pp = puzPlay;
    puzPlay = function (mv) {
      const Z = arena.puz, m = typeof coachMode === "function" ? coachMode() : "", g = Z.game, st = Z.status, idx = Z.idx, pre = g ? g.fen() : "";
      if (st === "play") { Z.gmNote = null; Z.gmBadge = null; }
      const out = _pp.apply(this, arguments);
      try { if (st === "play" && g && Z.game === g && m && typeof coachHintOk === "function" && coachHintOk(m) && (Z.idx > idx || Z.status === "solved")) puzzleGood(Z, pre, uciOf(pre, mv)); } catch (e) { console.warn("GM puzzle:", e); }
      return out;
    };
    window.puzPlay = puzPlay;
    const _pl = puzLoad;
    puzLoad = function () { const Z = arena.puz; if (Z.gmFollow) followStop(Z, true); Z.gmNote = null; Z.gmBadge = null; return _pl.apply(this, arguments); };
    const _bm = bossMove;
    bossMove = function (mv) {
      const B = arena.boss, g = B.game, st = B.status, idx = B.idx, pre = g ? g.fen() : "";
      if (st === "play") { B.gmNote = null; B.gmBadge = null; }
      const out = _bm.apply(this, arguments);
      try { if (st === "play" && g && B.game === g && (B.idx > idx || B.status === "hit")) puzzleGood(B, pre, uciOf(pre, mv)); } catch (e) { console.warn("GM boss:", e); }
      return out;
    };
  }

  // ================= رقعة التحليل: الأسهم (أخضر = الأفضل، أحمر = رد الخصم/التهديد) =================
  function anaArrows(board, A) {
    if (A.showLines === false || !A.game) return "";
    let svg = "";
    const mv = A.line && A.line[A.ply - 1], rv = mv && mv.rv, cur = get(A.game.fen());
    const bad = rv && !GOOD_TIERS.includes(rv.tier);
    const green = bad ? rv.bestUci : cur && cur.lines && cur.lines[0] ? cur.lines[0].uci : "";
    const red = bad ? rv.refUci : "";
    const arrow = (u, cls, col) => { if (!u) return ""; const a = coachSq(board, u.slice(0, 2)), b = coachSq(board, u.slice(2, 4)); return a && b ? coachArrow(a, b, cls, col) : ""; };
    svg += arrow(green, "eca-gm-best", "#81B64C");
    svg += arrow(red, "eca-gm-threat", "#CA3431");
    if (rv && mv) svg += badgeSVG(board, mv.uci.slice(2, 4), rv.tier);
    return svg;
  }

  window.ecaGM = { internal, store, get, review, classify, cardHTML, sound, repaint, follow: followNow, followStop, tiers: TIERS, tier: k => TIERS[k] || null, puzzleWrong, puzzleGood,
    get engine() { return GM.engine; }, set engine(v) { GM.engine = v; }, cache: GM.cache };
})(typeof window !== "undefined" ? window : globalThis);
