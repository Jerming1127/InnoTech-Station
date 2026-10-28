/**
 * Hidden staff entry: long → short → long on 「創科站」 station title.
 * No <a href>; no pointer cursor; navigates via JS after gesture.
 */
(function () {
  "use strict";

  var TARGET_URL =
    "staff/chuangkezhan-a556f366f6d8ff7fe1021fa889835603/leaderboard/";
  var LONG_MS = 650;
  var SHORT_MAX_MS = 320;
  var STEP_GAP_MS = 4500;

  var el = document.getElementById("station-zh-secret");
  if (!el) return;

  var step = 0; // 0 idle, 1 after long, 2 after long+short
  var downAt = 0;
  var activePointer = null;
  var resetTimer = null;
  var longArmed = false;
  var longTimer = null;

  function clearReset() {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  function scheduleReset() {
    clearReset();
    resetTimer = setTimeout(function () {
      step = 0;
      resetTimer = null;
    }, STEP_GAP_MS);
  }

  function go() {
    step = 0;
    clearReset();
    window.location.href = TARGET_URL;
  }

  function onDown(ev) {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if (activePointer !== null) return;
    activePointer = ev.pointerId;
    downAt = Date.now();
    longArmed = false;
    try {
      el.setPointerCapture(ev.pointerId);
    } catch (e) {}
    if (longTimer) clearTimeout(longTimer);
    longTimer = setTimeout(function () {
      longArmed = true;
      longTimer = null;
    }, LONG_MS);
  }

  function onUp(ev) {
    if (activePointer === null || ev.pointerId !== activePointer) return;
    activePointer = null;
    if (longTimer) {
      clearTimeout(longTimer);
      longTimer = null;
    }
    var held = Date.now() - downAt;
    var isLong = longArmed || held >= LONG_MS;
    var isShort = !isLong && held <= SHORT_MAX_MS;

    if (step === 0) {
      if (isLong) {
        step = 1;
        scheduleReset();
      } else {
        step = 0;
      }
      return;
    }
    if (step === 1) {
      if (isShort) {
        step = 2;
        scheduleReset();
      } else {
        // another long restarts sequence at step 1
        step = isLong ? 1 : 0;
        if (step === 1) scheduleReset();
        else clearReset();
      }
      return;
    }
    if (step === 2) {
      if (isLong) {
        go();
      } else {
        step = 0;
        clearReset();
      }
    }
  }

  function onCancel(ev) {
    if (activePointer !== null && ev.pointerId === activePointer) {
      activePointer = null;
      if (longTimer) {
        clearTimeout(longTimer);
        longTimer = null;
      }
    }
  }

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onCancel);
  el.addEventListener("lostpointercapture", onCancel);
  el.addEventListener("contextmenu", function (ev) {
    ev.preventDefault();
  });
})();
