(function () {
  var nav = document.getElementById('top-nav');
  if (!nav) return;

  var FADE_PX = 120;
  var reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  function apply() {
    var y = window.scrollY || window.pageYOffset || 0;
    var opacity;
    if (reduce) {
      opacity = y > 8 ? 0 : 1;
    } else {
      opacity = Math.max(0, 1 - y / FADE_PX);
    }
    nav.style.opacity = String(opacity);
    if (opacity <= 0.01) {
      nav.style.pointerEvents = 'none';
      nav.setAttribute('aria-hidden', 'true');
    } else {
      nav.style.pointerEvents = '';
      nav.removeAttribute('aria-hidden');
    }
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    if (reduce) {
      apply();
    } else {
      window.requestAnimationFrame(apply);
    }
  }

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
