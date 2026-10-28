/**
 * 龍虎榜 — reason catalogs + class tabs (no real student names).
 * Edit labels / suggested points (1–4) anytime; reload page to apply.
 */
(function (global) {
  "use strict";

  global.LonghuConfig = {
    /** Fixed class tabs — 龍虎榜 deliberately excludes 1C */
    CLASSES: [
      { id: "1a", short: "1A", name: "1A" },
      { id: "1b", short: "1B", name: "1B" },
      { id: "2a", short: "2A", name: "2A" },
      { id: "2b", short: "2B", name: "2B" },
      { id: "3b", short: "3B", name: "3B" },
    ],

    /**
     * Two catalogs. Each reason: { id, label, points } with points in 1–4.
     * Classroom UX: tap student → pick reason → points prefilled → confirm (can still tweak 1–4).
     */
    CATALOGS: [
      {
        id: "answer",
        title: "答啱問題",
        reasons: [
          { id: "ans-quick", label: "即時答啱", points: 1 },
          { id: "ans-explain", label: "答啱仲解釋到", points: 2 },
          { id: "ans-help", label: "幫同學解通", points: 3 },
          { id: "ans-challenge", label: "難題一次過答啱", points: 4 },
        ],
      },
      {
        id: "ten",
        title: "做啱實習",
        reasons: [
          { id: "ten-done", label: "完成實習任務", points: 2 },
          { id: "ten-neat", label: "做得齊整正確", points: 3 },
          { id: "ten-bonus", label: "提早／額外完成", points: 4 },
          { id: "ten-retry", label: "改錯後做啱", points: 1 },
        ],
      },
    ],
  };
})(window);
