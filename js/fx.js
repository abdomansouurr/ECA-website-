// ECA — fx.js: احتفالات خفيفة: كونفيتي وألعاب نارية واهتزاز الشاشة ونوافذ الإنجاز
// كله بيتوقف لو الجهاز طالب تقليل الحركة، والنوافذ بتستنى لحد ما اللعب يخلص عشان ما تقطعش الطالب

function fxCalm() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }

// ================= كونفيتي وألعاب نارية على Canvas واحد =================
const FX_COLORS = ["#38bdf8", "#a855f7", "#facc15", "#34d399", "#f472b6", "#fb923c"];
let fxCanvas = null, fxParts = [], fxFrame = 0, fxLast = 0;
function fxStart() {
  if (!fxCanvas) {
    fxCanvas = document.createElement("canvas");
    fxCanvas.className = "eca-fx-canvas";
    fxCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(fxCanvas);
  }
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  fxCanvas.width = innerWidth * scale;
  fxCanvas.height = innerHeight * scale;
  fxCanvas.getContext("2d").setTransform(scale, 0, 0, scale, 0, 0);
  if (!fxFrame) { fxLast = performance.now(); fxFrame = requestAnimationFrame(fxTick); }
}
function fxTick(now) {
  const ctx = fxCanvas.getContext("2d"), dt = Math.min(0.05, (now - fxLast) / 1000);
  fxLast = now;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  fxParts = fxParts.filter(p => (p.life -= dt) > 0);
  for (const p of fxParts) {
    p.vy += p.gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.spin += p.turn * dt;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin);
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (fxParts.length) { fxFrame = requestAnimationFrame(fxTick); return; }
  fxFrame = 0;
  fxCanvas.remove();
  fxCanvas = null;
}
function fxColor() { return FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)]; }
function ecaConfetti(amount) {
  if (fxCalm() || document.hidden) return;
  const count = Math.min(Number(amount) || 90, 160);
  for (let i = 0; i < count; i++) {
    fxParts.push({ x: Math.random() * innerWidth, y: -10 - Math.random() * innerHeight * 0.3, vx: -50 + Math.random() * 100, vy: 90 + Math.random() * 160, gravity: 120, spin: Math.random() * 6, turn: -5 + Math.random() * 10, size: 6 + Math.random() * 6, color: fxColor(), life: 2 + Math.random() });
  }
  fxStart();
}
function ecaFireworks(bursts) {
  if (fxCalm() || document.hidden) return;
  const total = Math.min(Number(bursts) || 3, 5);
  for (let b = 0; b < total; b++) {
    setTimeout(() => {
      const x = innerWidth * (0.2 + Math.random() * 0.6), y = innerHeight * (0.15 + Math.random() * 0.35), color = fxColor();
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2, speed = 90 + Math.random() * 130;
        fxParts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, gravity: 110, spin: 0, turn: 3, size: 5, color, life: 1 + Math.random() * 0.5 });
      }
      fxStart();
    }, b * 320);
  }
}
window.ecaConfetti = ecaConfetti;
window.ecaFireworks = ecaFireworks;

// ================= اهتزاز الشاشة =================
function ecaShake() {
  const el = document.getElementById("mainView");
  if (!el || fxCalm()) return;
  el.classList.remove("eca-shake");
  void el.offsetWidth;
  el.classList.add("eca-shake");
  setTimeout(() => el.classList.remove("eca-shake"), 450);
}
window.ecaShake = ecaShake;

// ================= نوافذ الإنجاز =================
let fxQueue = [], fxOpen = false;
function fxPlaying() {
  const a = window.arena || (typeof arena !== "undefined" ? arena : {}), play = s => s && ["play", "wrong", "live", "claiming"].includes(s.status);
  return tab === "arena" && (play(a.rush) || play(a.duel) || play(a.speed));
}
function fxFanfare() {
  if (window.ecaSfx) ecaSfx("levelup");
}
function fxNext() {
  if (fxOpen || !fxQueue.length) return;
  if (fxPlaying()) { setTimeout(fxNext, 1000); return; }
  const item = fxQueue.shift(), en = lang === "en", el = document.createElement("div");
  fxOpen = true;
  el.id = "ecaMilestone";
  el.className = "eca-spin-modal";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", item.title);
  // العنوان والنص بييجوا كنص بس، فمفيش HTML من بيانات المستخدم
  el.innerHTML = `<div class="gold-card rounded-2xl p-6 text-center space-y-3 eca-milestone-box">
    <div class="eca-milestone-icon" aria-hidden="true"></div>
    <h3 class="font-display font-bold text-2xl text-yellow-300"></h3>
    <p class="text-sm text-gray-300"></p>
    <button type="button" class="tap w-full rounded-xl text-sm font-bold gold-btn" onclick="ecaMilestoneClose()">${en ? "Awesome!" : "تمام!"}</button>
  </div>`;
  el.querySelector(".eca-milestone-icon").textContent = item.icon;
  el.querySelector("h3").textContent = item.title;
  el.querySelector("p").textContent = item.text || "";
  document.body.appendChild(el);
  fxFanfare();
  if (item.big) ecaFireworks(4); else ecaConfetti(90);
  const btn = el.querySelector("button");
  if (btn) btn.focus();
}
function ecaMilestoneClose() {
  const el = document.getElementById("ecaMilestone");
  if (el) el.remove();
  fxOpen = false;
  fxNext();
}
function ecaMilestone(item) { fxQueue.push(item); fxNext(); }
window.ecaMilestone = ecaMilestone;
window.ecaMilestoneClose = ecaMilestoneClose;
document.addEventListener("keydown", e => { if (e.key === "Escape" && fxOpen) ecaMilestoneClose(); });

// ================= التشجيع بالصوت =================
// جمل قصيرة بصوت المتصفح نفسه (من غير ملفات صوت). بتتقفل مع زرار الصوت أو من قايمة الحساب.
const CHEERS = {
  hype: { en: ["Brilliant!", "Unstoppable!", "What a move!"], ar: ["برافو عليك!", "محدش يقدر يوقفك!", "نقلة عبقرية!"] },
  retry: { en: ["Almost! Try again!", "So close! You can do it!"], ar: ["قربت! حاول تاني", "قريبة جدًا! انت تقدر"] }
};
window.ecaVoiceOff = false;
try { window.ecaVoiceOff = localStorage.getItem("ECA_VOICE_OFF") === "1"; } catch (_) {}
function ecaToggleVoice() {
  window.ecaVoiceOff = !window.ecaVoiceOff;
  try { localStorage.setItem("ECA_VOICE_OFF", window.ecaVoiceOff ? "1" : "0"); } catch (_) {}
  if (!window.ecaVoiceOff) ecaCheer("hype", true);
  render();
}
window.ecaToggleVoice = ecaToggleVoice;
let cheerLast = 0;
function ecaCheer(kind, force) {
  const set = CHEERS[kind];
  if (!set || window.ecaSfxMuted || window.ecaVoiceOff || document.hidden) return;
  const now = Date.now();
  if (!force && now - cheerLast < 3500) return;
  cheerLast = now;
  const en = lang === "en", list = en ? set.en : set.ar, line = list[Math.floor(Math.random() * list.length)];
  // الجملة بتظهر مكتوبة كمان، عشان لو الجهاز مفيهوش صوت للغة دي
  const pop = document.createElement("div");
  pop.className = "eca-cheer " + (kind === "hype" ? "is-hype" : "is-retry");
  pop.setAttribute("role", "status");
  pop.textContent = line;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1600);
  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;
  const voices = synth.getVoices(), voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(en ? "en" : "ar"));
  if (!voice) return;
  try {
    synth.cancel();
    const say = new SpeechSynthesisUtterance(line);
    say.voice = voice; say.lang = voice.lang; say.rate = kind === "hype" ? 1.05 : 0.95; say.pitch = kind === "hype" ? 1.2 : 1;
    synth.speak(say);
  } catch (_) {}
}
window.ecaCheer = ecaCheer;

// الألغاز الصعبة بتستاهل احتفال أكبر
{
  const _award = window.ecaAwardStudentActivity;
  window.ecaAwardStudentActivity = async function (source, key, score) {
    const result = await _award.apply(this, arguments);
    if (result && result.ok && !result.duplicate && source === "puzzle" && (key === "harder" || key === "hardest")) { ecaConfetti(70); ecaShake(); ecaCheer("hype"); }
    return result;
  };
}
