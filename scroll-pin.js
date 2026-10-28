(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 720px)').matches;
  if (reduce || mobile) return;

  var scene = document.getElementById('pin-scene');
  var board = document.getElementById('pin-board');
  if (!scene || !board) return;

  var ticking = false;
  function update() {
    ticking = false;
    var rect = scene.getBoundingClientRect();
    var total = scene.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var scrolled = Math.min(Math.max(-rect.top, 0), total);
    var p = scrolled / total;
    var scale = 1 - p * 0.08;
    board.style.transform = 'scale(' + scale.toFixed(4) + ')';
    board.style.opacity = String((1 - p * 0.12).toFixed(3));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
