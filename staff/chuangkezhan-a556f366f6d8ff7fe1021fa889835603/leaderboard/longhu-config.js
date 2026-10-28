/**
 * 龍虎榜 — reason catalogs + class tabs + optional Google Sheet CSV.
 * No real student names in this file.
 *
 * HOW TO PLUG A SHEET CSV URL:
 * 1. Open your 龍虎榜 Google Sheet (school account).
 * 2. Expected layout (UTF-8 CSV, comma-separated):
 *      Row 1 headers (any order; extras ignored):
 *        name 或 姓名   （必填）
 *        class 或 班別  （建議；值只接受 1A／1B／2A／2B／3B — 無 1C）
 *        score 或 分數  （可選；數字＝該同學總分）
 *      Example row:
 *        name,class,score
 *        同學甲,1A,12
 * 3. Publish CSV (pick one):
 *    A) File → Share → Publish to web → choose the sheet tab → CSV → Publish
 *       Copy the published CSV link.
 *    B) Or export URL (sheet must be viewable by link):
 *       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
 * 4. Paste that URL into SHEET_CSV_URL below.
 * 5. Reload 龍虎榜. When URL is set → roster+scores load read-only from Sheet.
 *    Empty SHEET_CSV_URL → localStorage editable Rank + file CSV／JSON import.
 */
(function (global) {
  "use strict";

  global.LonghuConfig = {
    /** Published CSV / export URL — leave "" until ready */
    SHEET_CSV_URL: "",

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
