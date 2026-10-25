(function () {
  var nav = document.getElementById('top-nav');
  if (!nav) return;

  var FADE_PX = 120;
  var LANG_KEY = 'innotech-lang';
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

  /* —— language toggle (nav labels only; Flags / station stay bilingual) —— */
  var langBtns = nav.querySelectorAll('.top-nav__lang-btn');
  var navLinks = nav.querySelectorAll('.top-nav__links a[data-zh][data-en]');

  function getLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'zh') return stored;
    } catch (e) {}
    return 'zh';
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'zh') lang = 'zh';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant-HK';
    navLinks.forEach(function (a) {
      var text = a.getAttribute(lang === 'en' ? 'data-en' : 'data-zh');
      if (text) a.textContent = text;
    });
    langBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang') || 'zh');
    });
  });

  setLang(getLang());

  /* —— mobile menu —— */
  var btn = document.getElementById('top-nav-menu-btn');
  var menu = document.getElementById('top-nav-menu');
  var backdrop = document.getElementById('top-nav-backdrop');
  if (!btn || !menu) return;

  var mq = window.matchMedia('(max-width: 720px)');

  function setOpen(open) {
    if (!mq.matches) open = false;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
    if (backdrop) {
      if (open) backdrop.removeAttribute('hidden');
      else backdrop.setAttribute('hidden', '');
    }
    document.body.classList.toggle('nav-menu-open', open);
  }

  function isOpen() {
    return btn.getAttribute('aria-expanded') === 'true';
  }

  btn.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      setOpen(false);
    });
  }

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      setOpen(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  function onMq() {
    if (!mq.matches) setOpen(false);
  }
  if (mq.addEventListener) mq.addEventListener('change', onMq);
  else if (mq.addListener) mq.addListener(onMq);
})();
