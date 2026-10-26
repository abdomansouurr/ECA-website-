/* ===== بيانات اختبار تحديد المستوى — الـ 8 مواقف (صور + اختيارات + الإجابة) =====
   كل موقف: img = صورة الموقف، q/qe = نص السؤال، opts = الاختيارات، ans = رقم الإجابة الصحيحة (يبدأ من 0).
   ترتيب الاختيارات بيتخلط عشوائي في كل مرة، وترتيب المواقف نفسه بيتخلط. المواقف بتيجي بعد الـ 12 لغز.
   لتغيير موقف: بدّل الصورة في img/placement/ وعدّل السطر ده. */
const _SIT_Q = "اختر الإجابة الصحيحة", _SIT_QE = "Select the answer";
window.ECA_PLACEMENT_SITUATIONS = [
  { img: "img/placement/s1.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["pin", "check", "double attack"], ans: 0 },
  { img: "img/placement/s2.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["double attack", "discovered attack", "twofold attack"], ans: 0 },
  { img: "img/placement/s3.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["discovered check", "discovered attack", "double attack"], ans: 1 },
  { img: "img/placement/s4.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["pin", "double attack", "discovered check"], ans: 2 },
  { img: "img/placement/s5.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["double attack", "double check", "fork"], ans: 1 },
  { img: "img/placement/s6.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["insufficient material", "stalemate", "checkmate"], ans: 1 },
  { img: "img/placement/s7.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["elimination of defense", "discovered check", "twofold attack"], ans: 0 },
  { img: "img/placement/s8.jpg", q: _SIT_Q, qe: _SIT_QE, opts: ["check", "checkmate", "stalemate"], ans: 1 }
];
