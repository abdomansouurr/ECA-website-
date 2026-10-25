// ECA — today.js: شاشة «النهاردة» للكوتش + تذكيرات واتساب جاهزة + مواعيد المجموعات (eca-v4)
// بيعتمد على: db, todayISO, stuMode, waLink, esc, setAtt, save, keepScroll, render, toast, trText, lang (من core.js)

    const WEEK_AR = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
    const WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];          // الأسبوع بيبدأ السبت
    const TODAY_ABS_DAYS = 30;                          // نافذة حساب الغياب (يوم)
    const TODAY_ABS_MIN = 3;                            // «غايب أكتر من مرتين» = 3 مرات أو أكتر
    const TODAY_PAY_DAYS = 30;                          // آخر دفعة أقدم من كده = متأخر
    let todaySchedOpen = false;

    // ---------- مساعدات ----------
    function L(ar, en) { return lang === "en" ? en : ar; }   // جُمل فيها أرقام: نكتبها باللغتين بدل القاموس
    function nClasses(n) { return n === 1 ? "حصة" : n === 2 ? "حصتين" : n <= 10 ? n + " حصص" : n + " حصة"; }
    function dayName(dow) { return lang === "en" ? WEEK_EN[dow] : WEEK_AR[dow]; }
    function groupSched(g) { const s = (db.groupSched || {})[g]; return s && typeof s === "object" ? s : null; }
    function hasClassOn(g, dow) { const s = groupSched(g); return !!(s && Array.isArray(s.days) && s.days.includes(dow)); }
    function fmtTime(t) {
      if (!/^\d{2}:\d{2}$/.test(t || "")) return "";
      let [h, m] = t.split(":").map(Number);
      const pm = h >= 12; h = h % 12 || 12;
      return `${h}:${String(m).padStart(2, "0")} ${lang === "en" ? (pm ? "PM" : "AM") : (pm ? "م" : "ص")}`;
    }
    function isoDaysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
    function daysSince(iso) {
      if (!/^\d{4}-\d{2}-\d{2}/.test(iso || "")) return null;
      return Math.floor((new Date(todayISO() + "T12:00:00Z") - new Date(String(iso).slice(0, 10) + "T12:00:00Z")) / 86400000);
    }
    function studentsOf(g) { return db.users.filter(u => u.role === "student" && (u.group || "") === g); }

    // غياب الطالب: عدد مرات الغياب في آخر 30 يوم + هل آخر حصتين متسجّلين غياب ورا بعض
    function absInfo(id) {
      const from = isoDaysAgo(TODAY_ABS_DAYS), marks = [];
      for (const d of Object.keys(db.attendance || {}).sort()) {
        const v = (db.attendance[d] || {})[id];
        if (v) marks.push([d, v]);
      }
      const recent = marks.filter(([d]) => d >= from);
      const count = recent.filter(([, v]) => v === "a").length;
      const last2 = marks.slice(-2);
      const streak = last2.length === 2 && last2.every(([, v]) => v === "a");
      const lastPresent = [...marks].reverse().find(([, v]) => v === "p" || v === "l");
      return { count, streak, lastPresent: lastPresent ? lastPresent[0] : null };
    }

    // المالية (للأدمن): من غير ما نعدّل بيانات الطالب
    function payInfo(s) {
      const fee = Number(s.courseFee) || 0, paid = Number(s.amountPaid) || 0;
      const rem = Math.max(0, fee - paid);
      const since = daysSince(s.lastPayDate);
      return { fee, paid, rem, since, late: rem > 0 && (since === null || since >= TODAY_PAY_DAYS) };
    }

    // ---------- رسايل واتساب ----------
    const ECA_HI = "أهلاً بحضرتك من Egypt Chess Academy (ECA)";
    function msgClass(s, sc) {
      const t = fmtTime(sc && sc.time);
      return `${ECA_HI}\nتذكير بحصة الشطرنج النهاردة للبطل ${s.name}${t ? " الساعة " + t : ""}${stuMode(s) === "online" ? " (أونلاين)" : ""}.\nمستنيينه`;
    }
    function msgAbsent(s, n) {
      return `${ECA_HI}\nحابين نطمّن على البطل ${s.name}، غاب ${nClasses(n)} في آخر ${TODAY_ABS_DAYS} يوم.\nلو فيه أي ظرف أو حاجة نقدر نساعد فيها قولولنا، عشان مايفوتهوش الدروس ويفضل ماشي مع مجموعته.`;
    }
    function msgTodayAbsent(s) {
      return `${ECA_HI}\nالبطل ${s.name} ماحضرش حصة النهاردة. نتمنى يكون بخير\nلو حابين نعوّضله الدرس قولولنا.`;
    }
    function msgPay(s, p) {
      return `${ECA_HI}\nتذكير ودي بخصوص اشتراك البطل (${s.name}${s.stuCode ? " - كود " + s.stuCode : ""}):\n• إجمالي الاشتراك: ${p.fee} ج.م\n• المسدد: ${p.paid} ج.م\n• المتبقي: ${p.rem} ج.م\nشكراً لتعاونكم معنا!`;
    }
    function msgGroup(g, sc) {
      const t = fmtTime(sc && sc.time);
      return `${ECA_HI}\nتذكير: حصة مجموعة «${g}» النهاردة${t ? " الساعة " + t : ""}.\nمستنيين الأبطال`;
    }
    function waBtn(s, msg, label, tone) {
      const base = waLink(s.parentPhone || s.phone);
      const cls = tone === "red" ? "bg-red-500/15 text-red-300 border-red-500/40" : tone === "amber" ? "bg-amber-500/15 text-amber-300 border-amber-500/40" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
      if (!base) return `<span class="text-[11px] text-gray-500" title="ضيف رقم ولي الأمر من متابعة الطلاب">مفيش رقم</span>`;
      return `<a href="${base}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" aria-label="واتساب ولي أمر ${esc(s.name)}" class="tap inline-flex items-center px-3 rounded-xl text-[11px] font-bold border ${cls}">${label}</a>`;
    }

    // ---------- أفعال ----------
    function setAttToday(id, st) { attDate = todayISO(); setAtt(id, st); }
    function markGroupToday(i, st) {
      if (!isCoach()) return;
      const g = (db.groups || [])[i]; if (g === undefined) return;
      const d = todayISO(), r = db.attendance[d] = db.attendance[d] || {};
      studentsOf(g).forEach(s => { if (st) r[s.id] = st; else delete r[s.id]; });
      if (!Object.keys(r).length) delete db.attendance[d];
      save(); keepScroll(render);
      toast(st ? "اتسجّل حضور المجموعة كلها" : "اتشال تسجيل المجموعة");
    }
    async function copyGroupMsg(i) {
      const g = (db.groups || [])[i]; if (g === undefined) return;
      const txt = msgGroup(g, groupSched(g));
      try { await navigator.clipboard.writeText(txt); toast("الرسالة اتنسخت — الصقها في جروب الواتساب"); }
      catch (_) { prompt(trText("انسخ الرسالة:"), txt); }
    }
    function schedEntry(i) {
      const g = (db.groups || [])[i]; if (g === undefined) return null;
      db.groupSched = db.groupSched || {};
      const cur = db.groupSched[g];
      db.groupSched[g] = { days: Array.isArray(cur && cur.days) ? cur.days.slice() : [], time: (cur && cur.time) || "" };
      return db.groupSched[g];
    }
    function toggleSchedDay(i, dow) {
      if (!isCoach()) return;
      const e = schedEntry(i); if (!e) return;
      e.days = e.days.includes(dow) ? e.days.filter(x => x !== dow) : e.days.concat(dow).sort((a, b) => a - b);
      save(); keepScroll(render);
    }
    function setSchedTime(i, t) {
      if (!isCoach()) return;
      const e = schedEntry(i); if (!e) return;
      e.time = /^\d{2}:\d{2}$/.test(t) ? t : "";
      save(); keepScroll(render);
    }

    // ---------- الحسابات المشتركة (الشاشة + كارت الرئيسية) ----------
    function todayData(u) {
      const d = todayISO(), dow = new Date().getDay(), rec = db.attendance[d] || {};
      const students = db.users.filter(x => x.role === "student");
      const groups = (db.groups || []).map((g, i) => ({ g, i, sc: groupSched(g) }))
        .filter(x => hasClassOn(x.g, dow))
        .sort((a, b) => String(a.sc.time || "99").localeCompare(String(b.sc.time || "99")));
      const expected = groups.reduce((n, x) => n + studentsOf(x.g).length, 0);
      const cnt = { p: 0, l: 0, a: 0 };
      groups.forEach(x => studentsOf(x.g).forEach(s => { if (rec[s.id]) cnt[rec[s.id]]++; }));
      const absent = students.map(s => ({ s, ...absInfo(s.id) }))
        .filter(x => x.count >= TODAY_ABS_MIN || x.streak)
        .sort((a, b) => b.count - a.count);
      const isAdmin = !!(u && u.isAdmin);
      const pay = isAdmin ? students.map(s => ({ s, p: payInfo(s) })).filter(x => x.p.rem > 0)
        .sort((a, b) => (b.p.late - a.p.late) || ((b.p.since ?? 9999) - (a.p.since ?? 9999)) || (b.p.rem - a.p.rem)) : [];
      const anySched = (db.groups || []).some(g => { const s = groupSched(g); return s && s.days && s.days.length; });
      return { d, dow, rec, groups, expected, cnt, absent, pay, payLate: pay.filter(x => x.p.late), isAdmin, anySched };
    }

    // كارت صغير في الرئيسية بتاعة الكوتش
    function todayHomeCard(u) {
      const T = todayData(u);
      const chip = (txt, cls) => `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}">${txt}</span>`;
      return `<div class="gold-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-2">
          <div class="text-sm font-bold text-yellow-300">النهاردة — ${dayName(T.dow)}</div>
          <div class="flex flex-wrap gap-2">
            ${chip(L(`${T.groups.length} حصص النهاردة`, `${T.groups.length} classes today`), "bg-black text-yellow-300 border-yellow-500/40")}
            ${chip(L(`${T.absent.length} غياب محتاج متابعة`, `${T.absent.length} absences to follow up`), T.absent.length ? "bg-red-500/15 text-red-300 border-red-500/40" : "bg-black text-gray-400 border-zinc-700")}
            ${T.isAdmin ? chip(L(`${T.payLate.length} متأخر في الدفع`, `${T.payLate.length} late payments`), T.payLate.length ? "bg-amber-500/15 text-amber-300 border-amber-500/40" : "bg-black text-gray-400 border-zinc-700") : ""}
          </div>
        </div>
        <button onclick="switchTab('today')" class="tap px-4 rounded-xl text-xs gold-btn">افتح شاشة النهاردة</button>
      </div>`;
    }

    // ---------- الشاشة ----------
    function renderTodayView(u) {
      const T = todayData(u);
      const dateLabel = new Date(T.d + "T12:00:00Z").toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
      const stat = (n, label, cls) => `<div class="rounded-xl bg-black/70 border ${cls} p-3 text-center"><div class="text-xl font-extrabold">${n}</div><div class="text-[11px] text-gray-400 mt-0.5">${label}</div></div>`;
      const attB = (s, st, txt) => `<button onclick="setAttToday('${s.id}','${st}')" class="att-btn att-${st} ${T.rec[s.id] === st ? 'on' : ''}">${txt}</button>`;

      const groupCard = x => {
        const list = studentsOf(x.g), t = fmtTime(x.sc.time);
        const done = list.filter(s => T.rec[s.id]).length;
        return `<div class="rounded-2xl bg-black/60 border border-yellow-500/25 p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-bold text-yellow-300">${esc(x.g)}</div>
              <div class="text-[11px] text-gray-400">${t ? "" + t + " • " : ""}${L(`${list.length} طالب • اتسجّل ${done} من ${list.length}`, `${list.length} students • ${done} of ${list.length} marked`)}</div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="markGroupToday(${x.i},'p')" class="tap px-3 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">الكل حاضر</button>
              <button onclick="copyGroupMsg(${x.i})" class="tap px-3 rounded-xl text-[11px] font-bold bg-zinc-900 text-yellow-300 border border-yellow-500/40">رسالة للجروب</button>
            </div>
          </div>
          ${list.length ? `<div class="divide-y divide-yellow-500/10">${list.map(s => `
            <div class="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div class="min-w-[120px]">
                <div class="text-sm font-bold text-white">${esc(s.name)}</div>
                <div class="text-[11px] text-gray-500">Step ${esc(String(s.level || 1))} • ${stuMode(s) === "online" ? "أونلاين" : "أوفلاين"}</div>
              </div>
              <div class="flex flex-wrap items-center gap-1.5">
                ${attB(s, "p", "حاضر")}${attB(s, "l", "متأخر")}${attB(s, "a", "غايب")}
                ${T.rec[s.id] === "a" ? waBtn(s, msgTodayAbsent(s), "غاب النهاردة", "red") : waBtn(s, msgClass(s, x.sc), "تذكير بالحصة")}
              </div>
            </div>`).join("")}</div>` : `<p class="text-xs text-gray-500">مفيش طلبة في المجموعة دي لسه.</p>`}
        </div>`;
      };

      const absRow = x => `<div class="py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div class="text-sm font-bold text-white">${esc(x.s.name)} <span class="text-[11px] text-gray-500">• ${esc(x.s.group || "بدون مجموعة")}</span></div>
          <div class="text-[11px] text-red-300">${L(`${x.count} غياب في آخر ${TODAY_ABS_DAYS} يوم`, `${x.count} absences in the last ${TODAY_ABS_DAYS} days`)}${x.streak ? L(" • آخر حصتين غياب ورا بعض", " • last two classes absent") : ""}${x.lastPresent ? L(" • آخر حضور: ", " • last present: ") + x.lastPresent : ""}</div>
        </div>
        ${waBtn(x.s, msgAbsent(x.s, x.count), "اطمّن على الطالب", "red")}
      </div>`;

      const payRow = x => `<div class="py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div class="text-sm font-bold text-white">${esc(x.s.name)} ${x.p.late ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">متأخر</span>' : ""}</div>
          <div class="text-[11px] text-gray-400">${L("المتبقي", "Balance")} <b class="text-amber-300">${x.p.rem} ${L("ج.م", "EGP")}</b> ${L("من", "of")} ${x.p.fee} • ${x.p.since === null ? L("مفيش دفعات متسجّلة", "no payments recorded") : L(`آخر دفعة من ${x.p.since} يوم`, `last payment ${x.p.since} days ago`)}</div>
        </div>
        ${waBtn(x.s, msgPay(x.s, x.p), "تذكير بالدفع", "amber")}
      </div>`;

      const schedEditor = () => `<div class="space-y-3">
        ${(db.groups || []).length ? (db.groups || []).map((g, i) => {
          const sc = groupSched(g) || { days: [], time: "" };
          return `<div class="rounded-xl bg-black/60 border border-yellow-500/20 p-3 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-sm font-bold text-yellow-300">${esc(g)}</span>
              <label class="text-[11px] text-gray-400 flex items-center gap-2">الساعة
                <input type="time" value="${esc(sc.time || "")}" onchange="setSchedTime(${i}, this.value)" class="tap bg-black border border-yellow-500/40 rounded-xl px-2 text-xs text-white" />
              </label>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${WEEK_ORDER.map(dw => `<button onclick="toggleSchedDay(${i},${dw})" aria-pressed="${(sc.days || []).includes(dw)}" class="tap px-3 rounded-xl text-[11px] font-bold ${(sc.days || []).includes(dw) ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/25'}">${dayName(dw)}</button>`).join("")}
            </div>
          </div>`;
        }).join("") : `<p class="text-xs text-gray-400">مفيش مجموعات لسه. ضيف مجموعات من «متابعة الطلاب والجروبات» الأول.</p>`}
      </div>`;

      return `<div class="space-y-5">
        <div class="gold-card rounded-2xl p-5 space-y-4">
          <div class="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">النهاردة</h2>
              <p class="text-xs text-gray-400">${dateLabel}</p>
            </div>
            <button onclick="switchTab('attendance')" class="tap px-4 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">صفحة الحضور الكاملة</button>
          </div>
          <div class="grid grid-cols-2 ${T.isAdmin ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-2">
            ${stat(T.groups.length, "حصص النهاردة", "border-yellow-500/30 text-yellow-300")}
            ${stat(T.expected, "طالب متوقع", "border-yellow-500/30 text-white")}
            ${stat(`${T.cnt.p + T.cnt.l}/${T.cnt.a}`, "حاضر / غايب", "border-emerald-500/30 text-emerald-300")}
            ${stat(T.absent.length, "غياب محتاج متابعة", "border-red-500/30 text-red-300")}
            ${T.isAdmin ? stat(T.payLate.length, "متأخر في الدفع", "border-amber-500/30 text-amber-300") : ""}
          </div>
        </div>

        <div class="gold-card rounded-2xl p-5 space-y-3">
          <h3 class="font-bold text-yellow-300">حصص النهاردة</h3>
          ${T.groups.length ? T.groups.map(groupCard).join("") : `<div class="text-xs text-gray-400 space-y-2">
            <p>${T.anySched ? L("مفيش حصص متسجّلة ليوم " + dayName(T.dow) + ".", "No classes scheduled for " + dayName(T.dow) + ".") : "لسه مواعيد المجموعات مش متسجّلة. حدّد أيام وساعة كل مجموعة مرة واحدة، والشاشة دي هتعرض حصص كل يوم لوحدها."}</p>
            ${T.anySched ? "" : `<button onclick="todaySchedOpen=true; render();" class="tap px-4 rounded-xl text-xs gold-btn">حدّد مواعيد المجموعات</button>`}
          </div>`}
        </div>

        <div class="gold-card rounded-2xl p-5 space-y-1">
          <h3 class="font-bold text-red-300">غياب محتاج متابعة</h3>
          <p class="text-[11px] text-gray-500">${L(`${TODAY_ABS_MIN} مرات غياب أو أكتر في آخر ${TODAY_ABS_DAYS} يوم، أو آخر حصتين غياب ورا بعض.`, `${TODAY_ABS_MIN}+ absences in the last ${TODAY_ABS_DAYS} days, or the last two classes absent.`)}</p>
          ${T.absent.length ? `<div class="divide-y divide-yellow-500/10">${T.absent.map(absRow).join("")}</div>` : `<p class="text-xs text-emerald-300 pt-2">مفيش حد محتاج متابعة دلوقتي.</p>`}
        </div>

        ${T.isAdmin ? `<div class="gold-card rounded-2xl p-5 space-y-1">
          <h3 class="font-bold text-amber-300">متبقي عليهم اشتراك</h3>
          <p class="text-[11px] text-gray-500">${L(`«متأخر» = عليه متبقي وآخر دفعة من ${TODAY_PAY_DAYS} يوم أو أكتر، أو مفيش دفعات. الأقدم الأول.`, `"Late" = has a balance and the last payment was ${TODAY_PAY_DAYS}+ days ago, or none. Oldest first.`)}</p>
          ${T.pay.length ? `<div class="divide-y divide-yellow-500/10">${T.pay.map(payRow).join("")}</div>` : `<p class="text-xs text-emerald-300 pt-2">كل الاشتراكات مدفوعة.</p>`}
        </div>` : ""}

        <div class="gold-card rounded-2xl p-5 space-y-3">
          <button onclick="todaySchedOpen=!todaySchedOpen; render();" aria-expanded="${todaySchedOpen}" class="w-full flex items-center justify-between text-start">
            <span class="font-bold text-yellow-300">مواعيد المجموعات</span>
            <span class="text-xs text-gray-400">${todaySchedOpen ? "▲ إخفاء" : "▼ تعديل"}</span>
          </button>
          ${todaySchedOpen ? schedEditor() : ""}
        </div>
      </div>`;
    }

    // ترجمة النصوص الثابتة للإنجليزي (الجُمل اللي فيها أرقام متكتبة باللغتين بـ L())
    DICT.push(
      ["افتح شاشة النهاردة", "Open today's screen"], ["النهاردة", "Today"], ["حصص النهاردة", "Today's classes"],
      ["حصص النهاردة", "Today's classes"], ["طالب متوقع", "expected students"], ["حاضر / غايب", "present / absent"],
      ["غياب محتاج متابعة", "Absences to follow up"], ["غياب محتاج متابعة", "Absences to follow up"], ["متأخر في الدفع", "Late payments"],
      ["متبقي عليهم اشتراك", "Outstanding fees"], ["صفحة الحضور الكاملة", "Full attendance page"], ["الكل حاضر", "All present"],
      ["رسالة للجروب", "Group message"], ["تذكير بالحصة", "Class reminder"], ["غاب النهاردة", "Absent today"],
      ["اطمّن على الطالب", "Check on student"], ["تذكير بالدفع", "Payment reminder"], ["مفيش رقم", "No number"],
      ["حدّد مواعيد المجموعات", "Set group schedules"], ["مواعيد المجموعات", "Group schedules"], ["▲ إخفاء", "▲ Hide"], ["▼ تعديل", "▼ Edit"],
      ["مفيش طلبة في المجموعة دي لسه.", "No students in this group yet."], ["مفيش حد محتاج متابعة دلوقتي.", "Nobody needs follow-up right now."],
      ["كل الاشتراكات مدفوعة.", "All fees are paid."], ["بدون مجموعة", "no group"], ["الساعة", "Time"],
      ["لسه مواعيد المجموعات مش متسجّلة. حدّد أيام وساعة كل مجموعة مرة واحدة، والشاشة دي هتعرض حصص كل يوم لوحدها.", "Group schedules aren't set yet. Set each group's days and time once, and this screen will list each day's classes automatically."],
      ["مفيش مجموعات لسه. ضيف مجموعات من «متابعة الطلاب والجروبات» الأول.", "No groups yet. Add groups from «Students & groups» first."],
      ["الرسالة اتنسخت — الصقها في جروب الواتساب", "Message copied — paste it in the WhatsApp group"], ["اتسجّل حضور المجموعة كلها", "Whole group marked present"],
      ["اتشال تسجيل المجموعة", "Group marks cleared"], ["انسخ الرسالة:", "Copy the message:"]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
