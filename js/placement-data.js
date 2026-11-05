/* ===== بيانات اختبار تحديد المستوى — الـ 8 مواقف (صور + اختيارات + الإجابة) =====
   كل موقف: img = صورة الموقف، q/qe = نص السؤال، opts = الاختيارات، ans = رقم الإجابة الصحيحة (يبدأ من 0).
   ترتيب الاختيارات بيتخلط عشوائي في كل مرة، وترتيب المواقف نفسه بيتخلط. المواقف بتيجي بعد الـ 12 لغز.
   لتغيير موقف: بدّل الصورة في img/placement/ وعدّل السطر ده. */
const _SIT_Q = "اختر الإجابة الصحيحة", _SIT_QE = "Select the answer";
window.ECA_PLACEMENT_SITUATIONS = [
  { img: "img/placement/s1.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["pin", "check", "double attack"], ans: 0 },
  { img: "img/placement/s2.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["double attack", "discovered attack", "pin"], ans: 0 },
  { img: "img/placement/s3.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["discovered check", "discovered attack", "double attack"], ans: 1 },
  { img: "img/placement/s4.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["pin", "double attack", "discovered check"], ans: 2 },
  { img: "img/placement/s5.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["double attack", "double check", "fork"], ans: 1 },
  { img: "img/placement/s6.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["insufficient material", "stalemate", "checkmate"], ans: 1 },
  { img: "img/placement/s7.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["removing the defender", "discovered check", "double attack"], ans: 0 },
  { img: "img/placement/s8.webp", q: _SIT_Q, qe: _SIT_QE, opts: ["check", "checkmate", "stalemate"], ans: 1 }
];
