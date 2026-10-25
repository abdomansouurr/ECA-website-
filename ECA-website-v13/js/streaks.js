// ECA — streaks.js: كارت السلسلة في رئيسية الطالب + الشارات الأسبوعية (eca-v5)
// بيعتمد على: streaks(), badgeList(), renderStudentHome (من extras.js)، todayISO, lang (من core.js)

    const WEEK_GOAL = 5;                                   // «أسبوع منتظم» = 5 أيام تمرين أو أكتر
    const DAY_MS = 864e5;
    const isoNoon = iso => Date.parse(iso + "T12:00:00Z");
    const isoOf = t => new Date(t).toISOString().slice(0, 10);

    // بداية الأسبوع (السبت) لأي تاريخ
    function weekStartISO(iso) {
      const t = isoNoon(iso), dow = new Date(t).getUTCDay();   // 0 = الأحد ... 6 = السبت
      return isoOf(t - ((dow + 1) % 7) * DAY_MS);
    }
    function cleanDays(days) { return Array.from(new Set(days || [])).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort(); }
    // أيام الأسبوع الحالي (سبت → جمعة): true لو اتمرّن
    function weekDots(days) {
      const set = new Set(cleanDays(days)), start = isoNoon(weekStartISO(todayISO()));
      return Array.from({ length: 7 }, (_, i) => { const d = isoOf(start + i * DAY_MS); return { d, on: set.has(d), today: d === todayISO(), future: d > todayISO() }; });
    }
    // عدد الأسابيع اللي اتمرّن فيها min أيام أو أكتر
    function weeksWith(days, min) {
      const per = {};
      cleanDays(days).forEach(d => { const w = weekStartISO(d); per[w] = (per[w] || 0) + 1; });
      return Object.values(per).filter(n => n >= min).length;
    }

    function streakCardHTML(u) {
      const a = u.arena || {}, st = streaks(a.days), dots = weekDots(a.days);
      const done = dots.filter(x => x.on).length, left = Math.max(0, WEEK_GOAL - done);
      const daysLeft = dots.filter(x => x.future || (x.today && !x.on)).length;
      const L = (ar, en) => lang === "en" ? en : ar;
      const names = lang === "en" ? ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] : ["سبت", "حد", "اتنين", "تلات", "أربع", "خميس", "جمعة"];
      const goalMsg = done >= 7 ? L("أسبوع ذهبي! اتمرّنت الـ 7 أيام", "Golden week! You trained all 7 days")
        : left === 0 ? L(`أسبوع منتظم! ${done} أيام — كمّل للأسبوع الذهبي`, `Regular week! ${done} days — keep going for a golden week`)
        : left <= daysLeft ? L(`فاضلك ${left} ${left === 1 ? "يوم" : left === 2 ? "يومين" : "أيام"} تمرين للأسبوع المنتظم`, `${left} more training day${left > 1 ? "s" : ""} for a regular week`)
        : L("الأسبوع ده فاته يبقى منتظم — ابدأ سلسلة جديدة النهاردة", "This week can't reach the goal — start a fresh streak today");
      const trainedToday = dots.some(x => x.today && x.on);
      return `<div class="gold-card rounded-2xl p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center ${st.current ? "bg-orange-500/15 text-orange-400 border border-orange-500/40" : "bg-zinc-900 text-gray-600 border border-zinc-800"}">${ICON("flame", "w-7 h-7")}</div>
            <div>
              <div class="text-2xl font-extrabold text-yellow-300">${st.current} <span class="text-sm text-gray-400 font-bold">${L(st.current === 1 ? "يوم ورا بعض" : "أيام ورا بعض", "day streak")}</span></div>
              <div class="text-[11px] text-gray-400">${L("أطول سلسلة:", "Best streak:")} <b class="text-white">${st.best}</b> • ${L("أسابيع منتظمة:", "Regular weeks:")} <b class="text-white">${weeksWith(a.days, WEEK_GOAL)}</b></div>
            </div>
          </div>
          ${trainedToday ? `<span class="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">${L("اتمرّنت النهاردة", "Trained today")}</span>`
            : `<button onclick="arena.sub='puzzles'; switchTab('arena')" class="tap px-4 rounded-xl text-xs gold-btn">${L("حل لغز وحافظ على السلسلة", "Solve a puzzle to keep it")}</button>`}
        </div>
        <div>
          <div dir="${lang === "en" ? "ltr" : "rtl"}" class="grid grid-cols-7 gap-1.5" role="list" aria-label="${L("أيام الأسبوع", "Days of the week")}">
            ${dots.map((x, i) => `<div role="listitem" class="text-center">
              <div class="mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${x.on ? "bg-yellow-500/90 border-yellow-300 text-black" : x.today ? "border-yellow-500/70 text-yellow-300 border-dashed" : "border-zinc-700 text-gray-600"}">${x.on ? "✓" : x.future ? "" : "·"}</div>
              <div class="text-[10px] mt-1 ${x.today ? "text-yellow-300 font-bold" : "text-gray-500"}">${names[i]}</div>
            </div>`).join("")}
          </div>
          <p class="text-xs text-gray-300 mt-3 text-center">${goalMsg}</p>
        </div>
      </div>`;
    }

    // كارت السلسلة فوق رئيسية الطالب
    {
      const _sh = renderStudentHome;
      renderStudentHome = function (s) { return `<div class="space-y-6">${streakCardHTML(s)}${_sh(s)}</div>`; };
    }

    // الشارات الأسبوعية (بتظهر في «الرتب والشارات»)
    {
      const _bl = badgeList;
      badgeList = function (s) {
        const days = (s.arena || {}).days, w5 = weeksWith(days, WEEK_GOAL), w7 = weeksWith(days, 7);
        return _bl(s).concat([{ cat: "الأسابيع المنتظمة", items: [
          ["أول أسبوع منتظم", "اتمرّن 5 أيام في أسبوع واحد", "5-days.png", w5 >= 1],
          ["أسبوع ذهبي", "اتمرّن الـ 7 أيام في أسبوع واحد", "7-days.png", w7 >= 1],
          ["شهر منتظم", "4 أسابيع منتظمة (5 أيام أو أكتر)", "30-days.png", w5 >= 4],
          ["3 أسابيع ذهبية", "3 أسابيع اتمرّنت فيها كل يوم", "chess-bishop-icon.svg", w7 >= 3],
          ["موسم منتظم", "12 أسبوع منتظم", "chess-rook-icon.svg", w5 >= 12],
          ["سنة منتظمة", "40 أسبوع منتظم", "chess-king-icon.svg", w5 >= 40]] }]);
      };
    }

    DICT.push(
      ["الأسابيع المنتظمة", "Regular weeks"], ["أول أسبوع منتظم", "First regular week"], ["اتمرّن 5 أيام في أسبوع واحد", "Train 5 days in one week"],
      ["أسبوع ذهبي", "Golden week"], ["اتمرّن الـ 7 أيام في أسبوع واحد", "Train all 7 days in one week"], ["شهر منتظم", "Regular month"],
      ["4 أسابيع منتظمة (5 أيام أو أكتر)", "4 regular weeks (5+ days)"], ["3 أسابيع ذهبية", "3 golden weeks"],
      ["3 أسابيع اتمرّنت فيها كل يوم", "3 weeks training every day"], ["موسم منتظم", "Regular season"], ["12 أسبوع منتظم", "12 regular weeks"],
      ["سنة منتظمة", "Regular year"], ["40 أسبوع منتظم", "40 regular weeks"],
      ["اللغز ده اتحسب قبل كده — النتيجة مش هتتكرر", "This puzzle was already counted — the result won't repeat"],
      ["لغز النهاردة اتحسب قبل كده", "Today's puzzle was already counted"],
      ["تعذّر بدء الامتحان. لو المحاولة اتحسبت قبل كده اطلب إعادة من الكوتش.", "Couldn't start the exam. If this attempt was already used, ask the coach for a retry."]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
