(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 720px)').matches;
  if (reduce || mobile) return;

  var scene = document.getElementById('pin-scene');
  var board = document.getElementById('pin-board');
  var train = document.getElementById('train-bar');
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

    /* MTR train graphic: emerge from under header, travel right */
    if (train) {
      var sticky = scene.querySelector('.pin-sticky');
      var track = sticky ? sticky.clientWidth : window.innerWidth;
      var barW = train.offsetWidth || 104;
      /* p=0 tucked left under header; p=1 exits past right edge */
      var start = -barW - 8;
      var end = track + 8;
      var x = start + p * (end - start);
      train.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    }
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
