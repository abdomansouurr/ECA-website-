// ECA — certs.js: «👑 شهادة تفوق وإنجاز» — AcademyCertificateBuilder
// شهادة 1600×1130 (عرضي) على Canvas من غير أي مكتبة: إطار ذهبي على أسود، تاج الأكاديمية، اسم البطل بالدهبي (#F5C518)،
// والإنجاز بالظبط (إتمام Step من منهج الخطوات، أو مركز في بطولة أرينا، أو تصنيف ECA جديد). التحميل PNG عالي الجودة،
// أو PDF حقيقي (صفحة A4 عرضي فيها الصورة)، والمشاركة بـ Web Share API (الصورة نفسها على الموبايل) أو واتساب برسالة جاهزة.
// بتفتح من: صندوق شهادات الطالب، لوحة الكوتش (ملف الطالب)، ترتيب البطولة (أول 3)، سطر التصنيف بعد الدور، وتقرير ولي الأمر.
// بيعتمد على: db, currUser, esc, lang, toast

const CRT = (ar, en) => lang === "en" ? en : ar;
const CERT_GOLD = "#F5C518", CERT_CRIMSON = "#B20710";
const CERT_STEP_AR = ["", "الخطوة الأولى", "الخطوة الثانية", "الخطوة الثالثة", "الخطوة الرابعة", "الخطوة الخامسة", "الخطوة السادسة"];
const CERT_RANK_AR = ["", "الأول", "الثاني", "الثالث"];
const CERT_SIGN = "كوتش / عبدالرحمن منصور — Egypt Chess Academy";
const CERT = { cur: null, url: "", busy: false };
function certText(s, max) { return String(s == null ? "" : s).replace(/[\u0000-\u001f<>`]/g, "").trim().slice(0, max || 80); }

const AcademyCertificateBuilder = {
  W: 1600, H: 1130,
  // o: { kind: "step"|"arena"|"rating", studentName, step, stepNameAr, tournamentName, rank, rating, date }
  lines(o) {
    if (o.kind === "step") return ["لإتمامه بنجاح", `${o.stepNameAr || CERT_STEP_AR[o.step] || "Step " + (o.step || 1)} (Step ${o.step || 1})`, "في منهج الخطوات الهولندي (Stappenmethode) بدقة تكتيكية متميزة"];
    if (o.kind === "arena") return ["لحصوله على", `المركز ${CERT_RANK_AR[o.rank] || o.rank} في ${o.tournamentName || "بطولة الأكاديمية"}`, `بتصنيف أكاديمي ${o.rating || 1000}`];
    return ["لوصوله إلى", `تصنيف أكاديمي ${o.rating || 1000}`, "في نظام تصنيف ECA الرسمي بأداء متميز في المباريات"];
  },
  async fonts() {
    if (!document.getElementById("cairoFontLink")) {
      const fl = document.createElement("link"); fl.id = "cairoFontLink"; fl.rel = "stylesheet";
      fl.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap"; document.head.appendChild(fl);
    }
    if (!document.fonts || !document.fonts.load) return;
    try { await Promise.race([Promise.all(["900 80px Cairo", "700 40px Cairo", "400 30px Cairo"].map(f => document.fonts.load(f, "شهادة"))), new Promise(r => setTimeout(r, 2500))]); } catch (_) {}
  },
  async render(o) {
    await this.fonts();
    const W = this.W, H = this.H, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const font = (w, px) => `${w} ${px}px Cairo, "Segoe UI", Tahoma, sans-serif`;
    // الخلفية: أسود سينمائي بلمعة دهبي في النص وأحمر خفيف على الأطراف
    const bg = c.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H / 2, W * 0.75);
    bg.addColorStop(0, "#2a1d06"); bg.addColorStop(0.45, "#120d05"); bg.addColorStop(1, "#050404");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const red = c.createLinearGradient(0, 0, W, 0);
    red.addColorStop(0, "rgba(178,7,16,.22)"); red.addColorStop(0.18, "rgba(178,7,16,0)"); red.addColorStop(0.82, "rgba(178,7,16,0)"); red.addColorStop(1, "rgba(178,7,16,.22)");
    c.fillStyle = red; c.fillRect(0, 0, W, H);
    // نقشة رقعة خفيفة
    c.save(); c.globalAlpha = 0.035; c.fillStyle = CERT_GOLD;
    for (let y = 0; y < H; y += 70) for (let x = (y / 70) % 2 ? 70 : 0; x < W; x += 140) c.fillRect(x, y, 70, 70);
    c.restore();
    // الإطار: ذهبي مزدوج + زوايا
    const gold = c.createLinearGradient(0, 0, W, H);
    gold.addColorStop(0, "#8a6a12"); gold.addColorStop(0.25, "#f7dc6f"); gold.addColorStop(0.5, "#b8860b"); gold.addColorStop(0.75, "#ffe9a3"); gold.addColorStop(1, "#8a6a12");
    c.strokeStyle = gold; c.lineWidth = 14; c.strokeRect(34, 34, W - 68, H - 68);
    c.lineWidth = 3; c.strokeRect(62, 62, W - 124, H - 124);
    c.strokeStyle = "rgba(178,7,16,.8)"; c.lineWidth = 2; c.strokeRect(74, 74, W - 148, H - 148);
    c.fillStyle = gold;
    for (const [x, y] of [[62, 62], [W - 62, 62], [62, H - 62], [W - 62, H - 62]]) { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-16, -16, 32, 32); c.restore(); }
    // التاج
    this.crown(c, W / 2, 168, 1.15, gold);
    c.textAlign = "center"; c.direction = "rtl"; c.textBaseline = "alphabetic";
    // الهيدر
    c.fillStyle = "#e9d8a6"; c.font = font(700, 34);
    c.fillText("أكاديمية مصر للشطرنج — Egypt Chess Academy", W / 2, 268);
    // العنوان
    c.save(); c.shadowColor = "rgba(245,197,24,.45)"; c.shadowBlur = 24; c.fillStyle = gold; c.font = font(900, 92);
    c.fillText("شهادة تفوق وإنجاز", W / 2, 388); c.restore();
    this.rule(c, W / 2, 425, 520, gold);
    c.fillStyle = "#d4d4d4"; c.font = font(400, 32);
    c.fillText("تُمنح هذه الشهادة بكل فخر للبطل", W / 2, 488);
    // الاسم بالدهبي
    let size = 84; c.font = font(900, size);
    const name = certText(o.studentName, 60) || "بطل الأكاديمية";
    while (c.measureText(name).width > W - 360 && size > 46) { size -= 4; c.font = font(900, size); }
    c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 12; c.fillStyle = CERT_GOLD; c.fillText(name, W / 2, 600); c.restore();
    // الإنجاز: سطر عادي، سطر دهبي عريض، وسطر عادي
    const [a, b, d] = this.lines(o);
    c.fillStyle = "#e5e5e5"; c.font = font(400, 34); c.fillText(a, W / 2, 680);
    size = 52; c.font = font(800, size);
    while (c.measureText(b).width > W - 300 && size > 30) { size -= 2; c.font = font(800, size); }
    c.fillStyle = "#ffe08a"; c.fillText(b, W / 2, 752);
    c.fillStyle = "#e5e5e5"; c.font = font(400, 32);
    this.wrap(c, d, W / 2, 820, W - 360, 44);
    // الفوتر: التاريخ، الختم، والتوقيع
    const date = certText(o.date, 40) || new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    c.strokeStyle = "rgba(245,197,24,.55)"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(1120, 985); c.lineTo(1430, 985); c.moveTo(170, 985); c.lineTo(480, 985); c.stroke();
    c.fillStyle = "#cfcfcf"; c.font = font(700, 26);
    c.fillText(date, 1275, 970); c.fillText("التاريخ", 1275, 1022);
    c.font = font(700, 24); c.fillText("كوتش / عبدالرحمن منصور", 325, 968);
    c.font = font(400, 22); c.fillText("Egypt Chess Academy — التوقيع", 325, 1022);
    this.seal(c, W / 2, 985, gold);
    return cv;
  },
  crown(c, x, y, s, fill) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath();
    c.moveTo(-70, 40); c.lineTo(-80, -30); c.lineTo(-40, 5); c.lineTo(0, -50); c.lineTo(40, 5); c.lineTo(80, -30); c.lineTo(70, 40); c.closePath();
    c.fillStyle = fill; c.shadowColor = "rgba(245,197,24,.5)"; c.shadowBlur = 20; c.fill();
    c.shadowBlur = 0; c.fillRect(-72, 46, 144, 14);
    c.fillStyle = CERT_CRIMSON;
    for (const [px, py, r] of [[-80, -34, 9], [0, -56, 11], [80, -34, 9]]) { c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#120d05"; c.beginPath(); c.arc(0, 18, 9, 0, Math.PI * 2); c.fill();
    c.restore();
  },
  rule(c, x, y, w, fill) {
    c.save(); c.fillStyle = fill; c.fillRect(x - w / 2, y, w, 3);
    c.translate(x, y + 1.5); c.rotate(Math.PI / 4); c.fillRect(-7, -7, 14, 14); c.restore();
  },
  seal(c, x, y, gold) {
    c.save(); c.translate(x, y);
    c.beginPath(); c.arc(0, 0, 92, 0, Math.PI * 2); c.fillStyle = "#6b0a0f"; c.fill();
    c.lineWidth = 6; c.strokeStyle = gold; c.stroke();
    c.beginPath(); c.arc(0, 0, 74, 0, Math.PI * 2); c.lineWidth = 2; c.stroke();
    c.fillStyle = "#ffe08a"; c.textAlign = "center"; c.direction = "ltr";
    c.font = `900 40px Cairo, "Segoe UI", sans-serif`; c.fillText("ECA", 0, 12);
    c.font = `700 15px Cairo, "Segoe UI", sans-serif`; c.fillText("OFFICIAL SEAL", 0, 40);
    c.fillText("★ ★ ★", 0, -30);
    c.restore();
  },
  wrap(c, text, x, y, max, lh) {
    const words = String(text).split(" "); let line = "", yy = y;
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (c.measureText(t).width > max && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t;
    }
    if (line) c.fillText(line, x, yy);
  },
  async dataURL(o) { return (await this.render(o)).toDataURL("image/png"); },
  // PDF حقيقي من غير مكتبات: صفحة A4 عرضي (842×595) فيها الشهادة كصورة JPEG
  async pdfBlob(o) {
    const cv = await this.render(o);
    const jpg = atob(cv.toDataURL("image/jpeg", 0.93).split(",")[1]);
    const img = new Uint8Array(jpg.length); for (let i = 0; i < jpg.length; i++) img[i] = jpg.charCodeAt(i);
    const enc = s => new TextEncoder().encode(s), parts = [], offs = [];
    let len = 0;
    const push = p => { const b = typeof p === "string" ? enc(p) : p; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n${body}\nendobj\n`); };
    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    offs[4] = len; push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);
    push(img); push("\nendstream\nendobj\n");
    const draw = "q 842 0 0 595 0 0 cm /Im0 Do Q";
    obj(5, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
    const xref = len;
    push("xref\n0 6\n0000000000 65535 f \n" + [1, 2, 3, 4, 5].map(n => String(offs[n]).padStart(10, "0") + " 00000 n \n").join(""));
    push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts, { type: "application/pdf" });
  }
};
window.AcademyCertificateBuilder = AcademyCertificateBuilder;

// ================= النافذة: معاينة + تحميل + واتساب =================
function certFileName(o, ext) { return "ECA-certificate-" + (certText(o.studentName, 40).replace(/[^A-Za-z0-9؀-ۿ]+/g, "-") || "student") + "." + ext; }
function certSave(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function certMsg(o) {
  const n = certText(o.studentName, 60);
  const what = o.kind === "step" ? `لإتمامه ${o.stepNameAr || CERT_STEP_AR[o.step] || ""} (Step ${o.step}) في منهج الخطوات الهولندي`
    : o.kind === "arena" ? `لحصوله على المركز ${CERT_RANK_AR[o.rank] || o.rank} في ${certText(o.tournamentName, 60)}` : `لوصوله لتصنيف أكاديمي ${o.rating}`;
  return `👑 أكاديمية مصر للشطرنج — Egypt Chess Academy\n\nألف مبروك للبطل ${n} ${what}! 🏆\n(مرفق شهادة التفوق والإنجاز)`;
}
async function ecaCertOpen(o) {
  if (!o || CERT.busy) return;
  CERT.busy = true;
  let url = "";
  try { url = await AcademyCertificateBuilder.dataURL(o); } catch (e) { console.warn("Certificate render failed:", e && e.message); }
  CERT.busy = false;
  if (!url) return toast(CRT("ماقدرناش نعمل الشهادة دلوقتي", "Could not create the certificate right now"));
  CERT.cur = o; CERT.url = url;
  let m = document.getElementById("ecaCertModal");
  if (!m) { m = document.createElement("div"); m.id = "ecaCertModal"; m.className = "eca-cert-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); document.body.appendChild(m); }
  m.setAttribute("aria-label", CRT("شهادة تفوق وإنجاز", "Certificate of excellence"));
  m.innerHTML = `<div class="eca-cert-box">
      <div class="eca-cert-head"><b>👑 ${CRT("شهادة تفوق وإنجاز", "Certificate of excellence")} — ${esc(certText(o.studentName, 60))}</b>
        <button type="button" onclick="ecaCertClose()" class="tap eca-cert-x" aria-label="${CRT("قفل", "Close")}" title="${CRT("قفل", "Close")}">✕</button></div>
      <img src="${url}" alt="${CRT("معاينة الشهادة", "Certificate preview")}" class="eca-cert-img" width="1600" height="1130" />
      <div class="eca-cert-acts">
        <button type="button" onclick="ecaCertDownload('png')" class="tap gold-btn eca-cert-btn">📥 ${CRT("تحميل الشهادة (صورة عالية الجودة / PDF)", "Download the certificate (HD image / PDF)")}</button>
        <button type="button" onclick="ecaCertDownload('pdf')" class="tap eca-cert-btn eca-cert-pdf">📄 PDF</button>
        <button type="button" onclick="ecaCertShare()" class="tap eca-cert-btn eca-cert-wa">📲 ${CRT("مشاركة عبر واتساب", "Share on WhatsApp")}</button>
      </div></div>`;
  m.classList.remove("hidden");
  m.onclick = e => { if (e.target === m) ecaCertClose(); };
  const x = m.querySelector(".eca-cert-x"); if (x) x.focus();
}
function ecaCertClose() { const m = document.getElementById("ecaCertModal"); if (m) { m.classList.add("hidden"); m.innerHTML = ""; } }
addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("ecaCertModal") && !document.getElementById("ecaCertModal").classList.contains("hidden")) ecaCertClose(); });
async function ecaCertDownload(kind) {
  const o = CERT.cur; if (!o) return;
  try {
    if (kind === "pdf") certSave(await AcademyCertificateBuilder.pdfBlob(o), certFileName(o, "pdf"));
    else certSave(await (await fetch(CERT.url)).blob(), certFileName(o, "png"));
  } catch (e) { console.warn("Certificate download failed:", e && e.message); toast(CRT("التحميل ماشتغلش، جرّب تاني", "The download did not work, try again")); }
}
async function ecaCertShare() {
  const o = CERT.cur; if (!o) return;
  const text = certMsg(o);
  try {
    const blob = await (await fetch(CERT.url)).blob(), file = new File([blob], certFileName(o, "png"), { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) { await navigator.share({ files: [file], text, title: "Egypt Chess Academy" }); return; }
    // الكمبيوتر: الصورة بتتحمّل، وواتساب بيفتح بالرسالة جاهزة (الصورة تتلزق في الجروب)
    certSave(blob, file.name);
  } catch (e) { if (e && e.name === "AbortError") return; }
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
}

// ================= مداخل الشهادة =================
function certStudent(sid) { return (typeof db !== "undefined" && db.users || []).find(u => u.id === sid && u.role === "student") || null; }
function ecaCertOpenStep(sid, idx) {
  const s = certStudent(sid), c = s && (s.certificates || [])[idx]; if (!c) return;
  ecaCertOpen({ kind: "step", studentName: c.studentName || s.name, step: Number(c.step) || 1, stepNameAr: CERT_STEP_AR[Number(c.step)] || "", date: c.date || "" });
}
function ecaCertOpenRating(ms, sid) {
  const s = sid ? certStudent(sid) : currUser(); if (!s || !(Number(ms) >= 1100)) return;
  const peak = Number.isInteger(s.ecaPeakRating) ? s.ecaPeakRating : 1000; if (peak < ms) return;
  ecaCertOpen({ kind: "rating", studentName: s.name, rating: Math.floor(Number(ms) / 100) * 100 });
}
function ecaCertOpenArena(tid, uid, rank) {
  const L = arena.live, a = L.ar; if (!a || L.tid !== tid || ![1, 2, 3].includes(rank)) return;
  const me = currUser(), staff = me && me.role !== "student" && me.role !== "parent";
  if (!me || (!staff && me.id !== uid)) return;
  const s = certStudent(uid) || (me.id === uid ? me : null), p = L.players.find(x => x.uid === uid);
  const name = s && s.name ? s.name : p ? p.n : "";
  ecaCertOpen({ kind: "arena", studentName: name, tournamentName: certText(a.name, 60), rank, rating: s && window.ecaRatingOf ? ecaRatingOf(s) : 1000 });
}
// زرار الشهادة في منصة التتويج (البطولة خلصت): للطالب نفسه، وللكوتش لأي واحد من الأوائل
function ecaCertArenaBtn(a, p, rank, u) {
  if (!a || !p || !u || typeof lvArStatus !== "function" || lvArStatus(a).k !== "over") return "";
  const staff = u.role !== "student" && u.role !== "parent";
  if (!staff && p.uid !== u.id) return "";
  if (!/^[A-Za-z0-9]{10,40}$/.test(String(p.uid)) || !/^[A-Za-z0-9]{6,40}$/.test(String(arena.live.tid || ""))) return "";
  return `<button type="button" onclick="ecaCertOpenArena('${arena.live.tid}','${p.uid}',${rank})" class="tap eca-cert-cta eca-cert-pod" aria-label="${CRT("شهادة المركز", "Placement certificate")} ${rank}">🎖️ ${CRT("شهادة", "Certificate")}</button>`;
}
Object.assign(window, { ecaCertOpen, ecaCertClose, ecaCertDownload, ecaCertShare, ecaCertOpenStep, ecaCertOpenRating, ecaCertOpenArena, ecaCertArenaBtn });

// تقرير ولي الأمر: الشهادات (كل Step اتقفل + تصنيف جديد) بضغطة
if (typeof renderParentReport === "function") {
  const _pr = renderParentReport;
  renderParentReport = function (stu) {
    const h = _pr.apply(this, arguments);
    if (!stu || !h || !/^[A-Za-z0-9]{10,40}$/.test(String(stu.id || ""))) return h;
    const steps = (stu.certificates || []).map((c, i) => `<button type="button" onclick="ecaCertOpenStep('${stu.id}',${i})" class="tap eca-cert-cta">👑 ${CRT("شهادة", "Certificate")} Step ${Number(c.step) || 1}</button>`);
    const peak = Number.isInteger(stu.ecaPeakRating) ? stu.ecaPeakRating : 1000;
    if (peak >= 1100) steps.push(`<button type="button" onclick="ecaCertOpenRating(${Math.floor(peak / 100) * 100},'${stu.id}')" class="tap eca-cert-cta">🎖️ ${CRT("شهادة تصنيف", "Rating certificate")} ${Math.floor(peak / 100) * 100}</button>`);
    if (!steps.length) return h;
    const box = `<section class="pr-card pr-certs"><h3>👑 ${CRT("شهادات التفوق والإنجاز", "Certificates of excellence")}</h3><div class="pr-cert-row">${steps.join("")}</div></section>`;
    return h.indexOf('<section class="pr-grid">') < 0 ? h : h.replace('<section class="pr-grid">', box + '<section class="pr-grid">');
  };
}
