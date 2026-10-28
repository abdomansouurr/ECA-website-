// ECA — annotate.js (eca-v36): أسهم ودوائر على الرقعة بكليك يمين زي Lichess بالظبط
//  • كليك يمين على مربع = دايرة، وسحب من مربع لمربع = سهم (نفس الشكل تاني بيمسحه)
//  • الألوان: عادي أخضر • Shift أحمر • Ctrl أزرق • Alt أصفر
//  • كليك شمال على الرقعة أو Esc أو تغيّر الوضع (نقلة) بيمسح العلامات
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", SEL = ".eca-board[data-h]";
  var COL = { g: "#15781B", r: "#882020", b: "#003088", y: "#e68f00" };
  var S = { fen: null, shapes: [] }, D = null;
  var st = document.createElement("style");
  st.textContent = ".eca-board{position:relative}.eca-ann{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}";
  document.head.appendChild(st);

  function sqAt(x, y) { var e = document.elementFromPoint(x, y), s = e && e.closest && e.closest(".eca-sq"); return s && s.dataset.sq ? s.dataset.sq : null; }
  function colorOf(e) { return e.shiftKey ? "r" : (e.ctrlKey || e.metaKey) ? "b" : e.altKey ? "y" : "g"; }
  function center(board, sq) {
    var first = board.querySelector(".eca-sq"), flip = !!first && first.dataset.sq === "h1";
    var f = "abcdefgh".indexOf(sq.charAt(0)), r = Number(sq.charAt(1));
    return [(flip ? 7 - f : f) + 0.5, (flip ? r - 1 : 8 - r) + 0.5];
  }
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function arrow(a, b, col, tmp) {
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
    var w = 0.16, hw = 0.34, hl = 0.42, tipX = b[0] - ux * 0.12, tipY = b[1] - uy * 0.12, bx = tipX - ux * hl, by = tipY - uy * hl;
    var sx = a[0] + ux * 0.0, sy = a[1] + uy * 0.0, P = [
      [sx + px * w / 2, sy + py * w / 2], [bx + px * w / 2, by + py * w / 2], [bx + px * hw, by + py * hw], [tipX, tipY],
      [bx - px * hw, by - py * hw], [bx - px * w / 2, by - py * w / 2], [sx - px * w / 2, sy - py * w / 2]];
    return el("polygon", { points: P.map(function (q) { return q[0].toFixed(3) + "," + q[1].toFixed(3); }).join(" "), fill: col, opacity: tmp ? 0.55 : 0.8 });
  }
  function draw(board) {
    if (!board) return;
    var old = board.querySelector(".eca-ann"); if (old) old.remove();
    var list = S.shapes.slice(); if (D && D.to) list.push({ from: D.from, to: D.to, c: D.c, tmp: true });
    if (!list.length) return;
    var svg = el("svg", { "class": "eca-ann", viewBox: "0 0 8 8", "aria-hidden": "true" });
    list.forEach(function (s) {
      if (s.from !== s.to) return; var c = center(board, s.from);
      svg.appendChild(el("circle", { cx: c[0], cy: c[1], r: 0.455, fill: "none", stroke: COL[s.c], "stroke-width": 0.075, opacity: s.tmp ? 0.55 : 0.8 }));
    });
    list.forEach(function (s) {
      if (s.from === s.to) return; svg.appendChild(arrow(center(board, s.from), center(board, s.to), COL[s.c], s.tmp));
    });
    board.appendChild(svg);
  }
  function toggle(n) {
    for (var i = 0; i < S.shapes.length; i++) {
      var s = S.shapes[i];
      if (s.from === n.from && s.to === n.to) { if (s.c === n.c) S.shapes.splice(i, 1); else s.c = n.c; return; }
    }
    S.shapes.push({ from: n.from, to: n.to, c: n.c });
  }
  function liveBoard() { return D && document.contains(D.board) ? D.board : document.querySelector(SEL); }

  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse") return;
    var b = e.target.closest && e.target.closest(SEL); if (!b) return;
    if (e.button === 2) {
      var sq = sqAt(e.clientX, e.clientY); if (!sq) return;
      e.preventDefault(); D = { board: b, from: sq, to: sq, c: colorOf(e) }; draw(b);
    } else if (e.button === 0 && S.shapes.length) { S.shapes = []; draw(b); }
  }, true);
  document.addEventListener("pointermove", function (e) {
    if (!D) return;
    var sq = sqAt(e.clientX, e.clientY);
    if (sq && sq !== D.to) { D.to = sq; draw(liveBoard()); }
  }, true);
  document.addEventListener("pointerup", function (e) {
    if (!D || e.button !== 2) return;
    var d = D; D = null; var sq = sqAt(e.clientX, e.clientY) || d.to;
    toggle({ from: d.from, to: sq, c: d.c }); draw(liveBoard());
  }, true);
  function cancel() { if (D) { D = null; draw(liveBoard()); } }
  document.addEventListener("pointercancel", cancel, true);
  window.addEventListener("blur", cancel);
  // منع قايمة المتصفح على الرقعة (وده بيوقف إلغاء الـ premove القديم بالكليك اليمين في ساحة التدريب؛ البديل: Esc أو كليك شمال)
  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest && e.target.closest(SEL)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && S.shapes.length) { S.shapes = []; draw(document.querySelector(SEL)); }
  });
  // الرقعة بتتبني من جديد مع كل نقلة: نرجّع الرسم، ولو الوضع اتغيّر نمسح العلامات (زي Lichess)
  new MutationObserver(function (ms) {
    var need = false;
    for (var i = 0; i < ms.length && !need; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) {
      var n = ms[i].addedNodes[j];
      if (n.nodeType === 1 && ((n.matches && n.matches(SEL)) || (n.querySelector && n.querySelector(SEL)))) { need = true; break; }
    }
    if (!need) return;
    var b = document.querySelector(SEL); if (!b) return;
    var f = b.dataset.fen || ""; if (S.fen !== f) { S.fen = f; S.shapes = []; }
    draw(b);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
