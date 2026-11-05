// Finance dashboard; loaded when staff opens finance.
const financeIsCoach = () => { const u = currUser(); return !!(u && u.role === "coach"); };
    window.finSubTab = window.finSubTab || "analytics";
    window.finSearchQ = window.finSearchQ || "";
    window.finSelectedStuId = window.finSelectedStuId || "";

    window.ensureStudentFinData = function(s, idx) {
      if (!s.stuCode) s.stuCode = "ECA-" + String(idx + 1).padStart(4, "0");
      s.courseFee = Number(s.courseFee) || 0;
      s.amountPaid = Number(s.amountPaid) || 0;
      s.remaining = Math.max(0, s.courseFee - s.amountPaid);
      if (!s.coachName) s.coachName = "Coach Abdelrahman";
      return s;
    };

    window.renderFinanceDashboardView = function() {
      const students = db.users.filter(u => u.role === "student").map((s, idx) => window.ensureStudentFinData(s, idx));
      const todayKey = todayISO();

      let totalFees = 0, totalPaid = 0, totalRem = 0;
      let todayCount = 0, todayPaid = 0, todayRem = 0;
      const byStep = {};
      const byCoach = {};

      students.forEach(s => {
        totalFees += s.courseFee;
        totalPaid += s.amountPaid;
        totalRem += s.remaining;

        if (s.lastPayDate === todayKey) {
          todayCount++;
          todayPaid += Number(s.lastPayAmount) || 0;
          todayRem += s.remaining;
        }

        const stLabel = "Step " + (s.level || 1);
        byStep[stLabel] = byStep[stLabel] || { count: 0, paid: 0, fee: 0 };
        byStep[stLabel].count++;
        byStep[stLabel].paid += s.amountPaid;
        byStep[stLabel].fee += s.courseFee;

        const cName = s.coachName || "Coach Abdelrahman";
        byCoach[cName] = byCoach[cName] || { count: 0, paid: 0, fee: 0 };
        byCoach[cName].count++;
        byCoach[cName].paid += s.amountPaid;
        byCoach[cName].fee += s.courseFee;
      });

      const tabBtnCls = (t) => `flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition ${window.finSubTab === t ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/20 hover:border-yellow-400'}`;

      return `
        <div class="space-y-6">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">لوحة تحليلات وحسابات الأكاديمية (ECA ERP Dashboard)</h2>
              <p class="text-xs text-gray-400 mt-1">إدارة الاشتراكات، المسدد، المتبقي، إحصائيات اليوم، وتحليل الإيرادات حسب المستوى والمدرب.</p>
            </div>
            <button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-sky-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي الطلاب (TOTAL STUDENTS)</div>
              <div class="text-2xl font-extrabold text-sky-400 mt-1">${students.length}</div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-yellow-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي قيمة الاشتراكات (TOTAL FEES)</div>
              <div class="text-2xl font-extrabold text-yellow-300 mt-1">${totalFees.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-emerald-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي المسدد (TOTAL PAID)</div>
              <div class="text-2xl font-extrabold text-emerald-400 mt-1">${totalPaid.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
            <div class="gold-card rounded-2xl p-4 text-center border-t-4 border-red-500">
              <div class="text-[11px] text-gray-400 font-bold">إجمالي المتبقي (REMAINING)</div>
              <div class="text-2xl font-extrabold text-red-400 mt-1">${totalRem.toLocaleString()} <span class="text-xs">EGP</span></div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 bg-black/60 p-2 rounded-2xl border border-yellow-500/20">
            <button onclick="window.finSubTab='analytics'; render();" class="${tabBtnCls('analytics')}">الداشبورد والتحليلات</button>
            <button onclick="window.finSubTab='manage'; render();" class="${tabBtnCls('manage')}">تسجيل وبحث وتعديل اشتراك طالب</button>
            <button onclick="window.finSubTab='today'; render();" class="${tabBtnCls('today')}">إحصائيات وتحصيلات اليوم (${todayKey})</button>
          </div>

          ${window.finSubTab === "analytics" ? window.renderFinAnalyticsSection(students, byStep, byCoach, totalFees) : ""}
          ${window.finSubTab === "manage" ? window.renderFinManageSection(students) : ""}
          ${window.finSubTab === "today" ? window.renderFinTodaySection(students, todayKey, todayCount, todayPaid, todayRem) : ""}
        </div>
      `;
    };

    window.renderFinAnalyticsSection = function(students, byStep, byCoach, totalFees) {
      const stepKeys = Object.keys(byStep).sort();
      const coachKeys = Object.keys(byCoach);
      const q = (window.finSearchQ || "").toLowerCase();
      return `
        <div class="grid md:grid-cols-2 gap-6">
          <div class="gold-card rounded-2xl p-5 space-y-3">
            <h3 class="font-display font-bold text-sm text-yellow-400">توزيع الطلاب والإيرادات حسب المستوى (Step 1 - 6)</h3>
            <div class="space-y-3">
              ${stepKeys.map(k => {
                const item = byStep[k];
                const pct = totalFees > 0 ? Math.round((item.fee / totalFees) * 100) : 0;
                return `
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-white">${k} <span class="text-gray-400">(${item.count} طلاب)</span></span>
                      <span class="text-emerald-300 font-bold">مسدد: ${item.paid.toLocaleString()} / ${item.fee.toLocaleString()} EGP (${pct}%)</span>
                    </div>
                    <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-yellow-500/20">
                      <div class="h-full gold-btn" style="width: ${Math.max(5, pct)}%"></div>
                    </div>
                  </div>`;
              }).join("")}
            </div>
          </div>

          <div class="gold-card rounded-2xl p-5 space-y-3">
            <h3 class="font-display font-bold text-sm text-yellow-400">إجمالي الاشتراكات والتحصيل حسب المدرب</h3>
            <div class="space-y-3">
              ${coachKeys.map(c => {
                const item = byCoach[c];
                const pct = item.fee > 0 ? Math.round((item.paid / item.fee) * 100) : 100;
                return `
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span class="font-bold text-white">${esc(c)} <span class="text-gray-400">(${item.count} طلاب)</span></span>
                      <span class="text-yellow-300 font-bold">تحصيل: ${item.paid.toLocaleString()} / ${item.fee.toLocaleString()} EGP (${pct}%)</span>
                    </div>
                    <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-emerald-500/20">
                      <div class="h-full bg-emerald-500" style="width: ${Math.max(5, pct)}%"></div>
                    </div>
                  </div>`;
              }).join("")}
            </div>
          </div>
        </div>

        <div class="gold-card rounded-2xl p-5 space-y-3">
          <div class="flex flex-wrap justify-between items-center gap-2">
            <h3 class="font-display font-bold text-sm text-yellow-400">سجل اشتراكات الطلاب المالي الشامل</h3>
            <input id="finQuickFilter" value="${esc(window.finSearchQ)}" oninput="window.finSearchQ=this.value; render();" placeholder="ابحث بالكود (ECA-0001) أو الاسم أو الموبايل..." class="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs text-white min-w-[240px]" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-white">
              <thead>
                <tr class="text-yellow-300 border-b border-yellow-500/30 text-left">
                  <th class="py-2 px-2">كود الطالب</th>
                  <th class="py-2 px-2">الاسم</th>
                  <th class="py-2 px-2">المستوى / الجروب</th>
                  <th class="py-2 px-2">المدرب</th>
                  <th class="py-2 px-2">قيمة الاشتراك</th>
                  <th class="py-2 px-2">المسدد</th>
                  <th class="py-2 px-2">المتبقي</th>
                  <th class="py-2 px-2">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-yellow-500/10">
                ${students.filter(s => !q || s.name.toLowerCase().includes(q) || s.stuCode.toLowerCase().includes(q) || String(s.phone||"").includes(q)).map(s => {
                  const wa = waLink(s.parentPhone || s.phone);
                  const waMsg = encodeURIComponent(`أهلاً بحضرتك من Egypt Chess Academy (ECA)\nتذكير ودي بخصوص اشتراك البطل (${s.name} - كود ${s.stuCode}):\n• إجمالي الاشتراك: ${s.courseFee} ج.م\n• المسدد: ${s.amountPaid} ج.م\n• المتبقي: ${s.remaining} ج.م\nشكراً لتعاونكم معنا!`);
                  return `
                    <tr class="hover:bg-yellow-500/5">
                      <td class="py-2.5 px-2 font-mono text-yellow-300 font-bold">${esc(s.stuCode)}</td>
                      <td class="py-2.5 px-2 font-bold">${esc(s.name)}</td>
                      <td class="py-2.5 px-2 text-gray-300">Step ${s.level} •${esc(s.group || "")}</td>
                      <td class="py-2.5 px-2 text-gray-300">${esc(s.coachName)}</td>
                      <td class="py-2.5 px-2 font-bold">${s.courseFee} EGP</td>
                      <td class="py-2.5 px-2 font-bold text-emerald-400">${s.amountPaid} EGP</td>
                      <td class="py-2.5 px-2 font-bold ${s.remaining > 0 ? 'text-red-400' : 'text-gray-400'}">${s.remaining} EGP</td>
                      <td class="py-2.5 px-2 flex gap-1.5">
                        <button onclick="openFinEditForStudent('${s.id}')" class="px-2.5 py-1 rounded-lg bg-zinc-800 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500 hover:text-black font-bold">تحصيل / تعديل</button>
                        ${s.remaining > 0 && wa ? `<a href="${wa}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">تذكير واتساب</a>` : ""}
                      </td>
                    </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    window.renderFinManageSection = function(students) {
      const sel = students.find(s => s.id === window.finSelectedStuId) || students[0] || null;
      const fee = sel ? sel.courseFee : 0;
      const paid = sel ? sel.amountPaid : 0;
      const rem = Math.max(0, fee - paid);

      return `
        <div class="gold-card rounded-2xl p-6 max-w-3xl mx-auto space-y-5">
          <div class="flex flex-wrap justify-between items-center gap-3 border-b border-yellow-500/20 pb-3">
            <h3 class="font-display font-bold text-lg text-yellow-400">استمارة تسجيل وتحديث رسوم الطالب</h3>
            <button onclick="openAddStu()" class="px-3 py-1.5 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">طالب جديد بالكامل</button>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-400 mb-1">اختر الطالب أو ابحث بكوده (ECA):</label>
              <select onchange="window.finSelectedStuId=this.value; render();" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-xs text-yellow-300 font-bold">
                ${students.map(s => `<option value="${s.id}" ${sel && sel.id === s.id ? 'selected' : ''}>${esc(s.stuCode)} —${esc(s.name)} (@${esc(s.username)}) \vert{} المتبقي: ${s.remaining} EGP</option>`).join("")}
              </select>
            </div>

            ${sel ? `
              <div>
                <label class="block text-xs text-gray-400 mb-1">اسم الطالب</label>
                <input id="finName" value="${esc(sel.name)}" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                <input id="finPhone" value="${esc(sel.parentPhone || sel.phone || '')}" placeholder="010XXXXXXXX" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">المستوى / الدورة التدريبية</label>
                <select id="finLevel" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-yellow-300">
                  ${[1,2,3,4,5,6].map(l => `<option value="${l}" ${Number(sel.level)===l?'selected':''}>Step ${l}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">اسم المدرب المحاضر</label>
                <input id="finCoach" value="${esc(sel.coachName || 'Coach Abdelrahman')}" class="w-full bg-black border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">قيمة الكورس الإجمالية (EGP)</label>
                <input id="finFee" type="number" min="0" value="${fee}" oninput="updateLiveCalcBox()" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white font-bold" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">إجمالي المبلغ المسدد (EGP)</label>
                <input id="finPaid" type="number" min="0" value="${paid}" oninput="updateLiveCalcBox()" class="w-full bg-black border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold" />
              </div>
            ` : ""}
          </div>

          <div class="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/80 border border-yellow-500/30 text-center">
            <div>
              <div class="text-[11px] text-gray-400">قيمة الكورس</div>
              <div id="liveDispFee" class="text-lg font-extrabold text-white mt-0.5">${fee.toLocaleString()} EGP</div>
            </div>
            <div>
              <div class="text-[11px] text-gray-400">المبلغ المسدد</div>
              <div id="liveDispPaid" class="text-lg font-extrabold text-emerald-400 mt-0.5">${paid.toLocaleString()} EGP</div>
            </div>
            <div>
              <div class="text-[11px] text-gray-400">المبلغ المتبقي</div>
              <div id="liveDispRem" class="text-lg font-extrabold text-red-400 mt-0.5">${rem.toLocaleString()} EGP</div>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <button onclick="saveStudentFinanceRecord('${sel ? sel.id : ''}')" class="px-6 py-2.5 rounded-xl text-xs gold-btn">حفظ البيانات المالية وتحديث الداشبورد</button>
          </div>
        </div>
      `;
    };

    window.renderFinTodaySection = function(students, todayKey, todayCount, todayPaid, todayRem) {
      const todayStudents = students.filter(s => s.lastPayDate === todayKey);
      return `
        <div class="space-y-5">
          <div class="grid sm:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">عمليات تحصيل اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayCount}</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">إجمالي المحصل اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayPaid.toLocaleString()} EGP</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">متبقيات طلاب اليوم</div>
              <div class="text-2xl font-extrabold mt-1">${todayRem.toLocaleString()} EGP</div>
            </div>
            <div class="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white text-center shadow-lg">
              <div class="text-xs opacity-90">تاريخ اليوم</div>
              <div class="text-lg font-extrabold mt-2">${todayKey}</div>
            </div>
          </div>

          <div class="gold-card rounded-2xl p-5">
            <h4 class="font-bold text-sm text-yellow-400 mb-3">قائمة الطلاب المسددين اليوم (${todayKey}):</h4>
            ${todayStudents.length === 0 ? `<p class="text-xs text-gray-400 text-center py-4">لا توجد تحصيلات مسجلة بتاريخ اليوم حتى الآن.</p>` : `
              <div class="space-y-2">
                ${todayStudents.map(s => `
                  <div class="p-3 rounded-xl bg-black/70 border border-yellow-500/20 flex justify-between items-center text-xs">
                    <span><b class="text-yellow-300">${esc(s.stuCode)}</b> — ${esc(s.name)} (Step ${s.level})</span>
                    <span class="text-emerald-400 font-bold">سدد اليوم: ${Number(s.lastPayAmount||0).toLocaleString()} EGP | المتبقي: ${s.remaining.toLocaleString()} EGP</span>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        </div>
      `;
    };

    window.updateLiveCalcBox = function() {
      const fee = parseFloat(document.getElementById("finFee").value) || 0;
      const paid = parseFloat(document.getElementById("finPaid").value) || 0;
      const rem = Math.max(0, fee - paid);
      document.getElementById("liveDispFee").textContent = fee.toLocaleString() + " EGP";
      document.getElementById("liveDispPaid").textContent = paid.toLocaleString() + " EGP";
      document.getElementById("liveDispRem").textContent = rem.toLocaleString() + " EGP";
    };

    window.openFinEditForStudent = function(stuId) {
      window.finSelectedStuId = stuId;
      window.finSubTab = "manage";
      render();
    };

    window.saveStudentFinanceRecord = function(stuId) {
      if (!financeIsCoach()) return;
      const s = db.users.find(u => u.id === stuId);
      if (!s) return;
      const prevPaid = Number(s.amountPaid) || 0;
      const newFee = Math.max(0, parseFloat(document.getElementById("finFee").value) || 0);
      const newPaid = Math.max(0, parseFloat(document.getElementById("finPaid").value) || 0);

      s.name = document.getElementById("finName").value.trim() || s.name;
      s.parentPhone = document.getElementById("finPhone").value.trim();
      s.level = Number(document.getElementById("finLevel").value) || s.level;
      s.coachName = document.getElementById("finCoach").value.trim() || "Coach Abdelrahman";
      s.courseFee = newFee;
      s.amountPaid = newPaid;
      s.remaining = Math.max(0, newFee - newPaid);

      if (newPaid > prevPaid) {
        const diff = newPaid - prevPaid;
        if (s.lastPayDate === todayISO()) {
          s.lastPayAmount = (Number(s.lastPayAmount) || 0) + diff;
        } else {
          s.lastPayDate = todayISO();
          s.lastPayAmount = diff;
        }
      }
      save();
      window.finSubTab = "analytics";
      render();
      toast(`تم تحديث حساب الطالب (${s.stuCode}) — المتبقي: ${s.remaining} EGP`);
    };

    window.exportFinanceCSV = function() {
      if (!financeIsCoach()) return;
      const students = db.users.filter(u => u.role === "student").map((s, i) => window.ensureStudentFinData(s, i));
      const rows = [["Student ID", "Student Name", "Phone", "Step Level", "Coach", "Total Fee (EGP)", "Amount Paid (EGP)", "Remaining (EGP)", "Last Payment Date"]];
      students.forEach(s => {
        rows.push([s.stuCode, s.name, s.parentPhone || s.phone || "", "Step " + s.level, s.coachName, s.courseFee, s.amountPaid, s.remaining, s.lastPayDate || "—"]);
      });
      const csv = "\ufeff" + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
      dl("ECA-Financial-Dashboard-" + todayISO() + ".csv", csv, "text/csv;charset=utf-8");
      toast("تم تنزيل شيت الحسابات متوافق مع Excel و Google Sheets!");
    };
// ================= 1. ترجمة صفحة الحسابات والداشبورد للإنجليزية (AR / EN) =================
    const FIN_DICT = [
      ["الحسابات والداشبورد", "Finance & ERP"],
      ["لوحة تحليلات وحسابات الأكاديمية (ECA ERP Dashboard)", "ECA Financial & Analytics ERP Dashboard"],
      ["إدارة الاشتراكات، المسدد، المتبقي، إحصائيات اليوم، وتحليل الإيرادات حسب المستوى والمدرب.", "Manage subscriptions, paid & remaining balances, daily collections, and revenue by level & coach."],
      ["⬇ تصدير التقرير المالي (Excel/CSV)", "⬇ Export Financial Report (Excel/CSV)"],
      ["قفل الحسابات", "Lock Finance"],
      ["إجمالي الطلاب (TOTAL STUDENTS)", "TOTAL STUDENTS"],
      ["إجمالي قيمة الاشتراكات (TOTAL FEES)", "TOTAL SUBSCRIPTION FEES"],
      ["إجمالي المسدد (TOTAL PAID)", "TOTAL PAID"],
      ["إجمالي المتبقي (REMAINING)", "TOTAL REMAINING"],
      ["الداشبورد والتحليلات", "Analytics Dashboard"],
      ["تسجيل وبحث وتعديل اشتراك طالب", "Student Billing & Search"],
      ["إحصائيات وتحصيلات اليوم", "Today's Collections"],
      ["توزيع الطلاب والإيرادات حسب المستوى (Step 1 - 6)", "Students & Revenue by Level (Step 1 - 6)"],
      ["إجمالي الاشتراكات والتحصيل حسب المدرب", "Subscriptions & Collection by Coach"],
      ["سجل اشتراكات الطلاب المالي الشامل", "Complete Student Financial Registry"],
      ["ابحث بالكود (ECA-0001) أو الاسم أو الموبايل...", "Search by code (ECA-0001), name, or phone..."],
      ["كود الطالب", "Student ID"],
      ["الاسم", "Name"],
      ["المستوى / الجروب", "Level / Group"],
      ["المدرب", "Coach"],
      ["قيمة الاشتراك", "Course Fee"],
      ["المسدد", "Paid"],
      ["المتبقي:", "Remaining:"],
      ["المتبقي", "Remaining"],
      ["إجراءات سريعة", "Quick Actions"],
      ["تحصيل / تعديل", "Collect / Edit"],
      ["تذكير واتساب", "WhatsApp Reminder"],
      ["استمارة تسجيل وتحديث رسوم الطالب", "Student Fee Registration & Update Form"],
      ["طالب جديد بالكامل", "Add New Student"],
      ["اختر الطالب أو ابحث بكوده (ECA):", "Select Student or Search by ID (ECA):"],
      ["اسم الطالب", "Student Name"],
      ["رقم هاتف ولي الأمر (واتساب)", "Parent Phone (WhatsApp)"],
      ["المستوى / الدورة التدريبية", "Level / Course"],
      ["اسم المدرب المحاضر", "Assigned Coach"],
      ["قيمة الكورس الإجمالية (EGP)", "Total Course Fee (EGP)"],
      ["إجمالي المبلغ المسدد (EGP)", "Total Amount Paid (EGP)"],
      ["قيمة الكورس", "Course Fee"],
      ["المبلغ المسدد", "Amount Paid"],
      ["المبلغ المتبقي", "Remaining Balance"],
      ["حفظ البيانات المالية وتحديث الداشبورد", "Save Financial Record & Update Dashboard"],
      ["عمليات تحصيل اليوم", "Today's Transactions"],
      ["إجمالي المحصل اليوم", "Total Collected Today"],
      ["متبقيات طلاب اليوم", "Today's Students Remaining"],
      ["تاريخ اليوم", "Today's Date"],
      ["قائمة الطلاب المسددين اليوم", "Students Who Paid Today"],
      ["لا توجد تحصيلات مسجلة بتاريخ اليوم حتى الآن.", "No collections recorded for today yet."],
      ["سدد اليوم:", "Paid today:"],
      ["طلاب)", "students)"],
      ["مسدد:", "Paid:"],
      ["تحصيل:", "Collected:"],
      ["قسم الإدارة المالية (للمديرين فقط)", "Financial Management (Admins Only)"],
      ["هذا القسم خاص بإدارة الأكاديمية. يرجى إدخال الباسورد الإداري للمتابعة:", "This section is restricted to Academy Management. Enter Admin Password:"],
      ["أدخل باسورد الإدارة...", "Enter Admin Password..."],
      ["فتح لوحة الحسابات", "Unlock Finance Dashboard"],
      ["تم فتح لوحة الحسابات الإدارية", "Admin Finance Dashboard Unlocked"],
      ["تم قفل لوحة الحسابات", "Finance Dashboard Locked"],
      ["باسورد الإدارة غير صحيح", "Incorrect Admin Password"]
    ];
    FIN_DICT.forEach(pair => {
      if (!DICT.some(d => d[0] === pair[0])) DICT.push(pair);
    });
    DICT.sort((a, b) => b[0].length - a[0].length);
    window.unlockFinanceAdmin = function (ev) { if (ev) ev.preventDefault(); };
    window.lockFinanceAdmin = function () {};
    window.renderFinanceLockScreen = function () {
      return `
        <div class="max-w-md mx-auto mt-10 gold-card rounded-2xl p-6 text-center space-y-4 border-2 border-yellow-500/40">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-black border-2 border-yellow-500 flex items-center justify-center text-yellow-300 shadow-lg">${ICON("lock", "w-7 h-7")}</div>
          <h2 class="font-display font-bold text-xl gold-gradient-text">القسم المالي (للإدارة فقط)</h2>
          <p class="text-xs text-gray-400">الحساب ده مش عنده صلاحية الأدمن. الصلاحية بتتفعّل من لوحة Firebase.</p>
        </div>
      `;
    };

    // إضافة زر "قفل الحسابات" داخل الداشبورد بعد فتحها
    const _origRenderFinanceDashboardView = window.renderFinanceDashboardView;
    window.renderFinanceDashboardView = function() {
      if (!window.isFinanceAdminUnlocked) {
        return window.renderFinanceLockScreen();
      }
      const html = _origRenderFinanceDashboardView();
      return html.replace(
        `<button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button>`,
        `<div class="flex gap-2"><button onclick="exportFinanceCSV()" class="px-4 py-2 rounded-xl text-xs gold-btn">⬇ تصدير التقرير المالي (Excel/CSV)</button></div>`
      );
    };

    // تشغيل المنصة فوراً بعد تحميل كل الإضافات
