/* ===== بيانات اختبار تحديد المستوى — الـ 8 مواقف =====
   ⚠️ دي مواقف مبدئية (تجريبية) لحد ما تتبدّل بالمواقف الحقيقية بتاعتكم.
   عشان تغيّرها: عدّل المصفوفة تحت بس (مفيش حاجة تانية محتاجة تتغيّر):
     fen  : وضع الرقعة (FEN)
     q    : نص السؤال بالعربي      qe: نصه بالإنجليزي
     opts : الاختيارات (نص قصير، لازم 2–6 اختيارات)
     ans  : رقم الإجابة الصحيحة جوه opts (يبدأ من 0)
   ترتيب الاختيارات بيتخلط عشوائي في كل مرة، والمواقف نفسها بتتخلط. */
window.ECA_PLACEMENT_SITUATIONS = [
  { fen: "6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتكش مات؟", qe: "You are White. Which move is checkmate?", opts: ["Ra8#", "Ra7", "Rh1", "Kd2"], ans: 0 },
  { fen: "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتهاجم الملك والقلعة مع بعض (شوكة)؟", qe: "You are White. Which move forks the king and the rook?", opts: ["Nc7+", "Nb6", "Ne7", "Nf6+"], ans: 0 },
  { fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتكش مات؟", qe: "You are White. Which move is checkmate?", opts: ["Nf7#", "Ne6", "Nh3", "Kf1"], ans: 0 },
  { fen: "4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1", q: "أنت بالأبيض. إيه أحسن نقلة؟", qe: "You are White. What is the best move?", opts: ["Rxd5", "Rd2", "Kd2", "Ke2"], ans: 0 },
  { fen: "7k/8/6K1/8/8/8/8/6Q1 w - - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتكش مات؟", qe: "You are White. Which move is checkmate?", opts: ["Qg7#", "Qg8+", "Qh1+", "Kh6"], ans: 0 },
  { fen: "k7/8/8/8/8/2K5/1R6/7R w - - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتكش مات؟", qe: "You are White. Which move is checkmate?", opts: ["Ra1#", "Rh8+", "Rb7", "Kb4"], ans: 0 },
  { fen: "4k3/8/8/8/8/8/4r3/4K3 w - - 0 1", q: "أنت بالأبيض. إيه أحسن نقلة؟", qe: "You are White. What is the best move?", opts: ["Kxe2", "Kd1", "Kf1"], ans: 0 },
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1", q: "أنت بالأبيض. إيه النقلة اللي بتكش مات؟", qe: "You are White. Which move is checkmate?", opts: ["Qxf7#", "Qxe5+", "Bxf7+", "Qh4"], ans: 0 }
];
