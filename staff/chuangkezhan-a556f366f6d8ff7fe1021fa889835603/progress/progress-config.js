/**
 * 上課日子教學進度表 — Google Sheet (read-only) + week×class matrix.
 *
 * HOW TO PLUG A SHEET CSV URL:
 * 1. Open your school Google Sheet for progress (學校帳戶).
 * 2. Layout expected (first sheet / gid you publish) — weeks as rows, classes as columns:
 *      Row 1 header: 週次, 1A, 1B, 1C, 2A, 2B, 3B
 *      Rows: W1…W18（或 第1週…第18週）— first column = week label
 *      Cells = that week’s progress text per class (plain).
 *      (Legacy class×week CSV still parsed as fallback.)
 * 3. Publish CSV (pick one):
 *    A) File → Share → Publish to web → choose the sheet tab → CSV → Publish
 *       Copy the published CSV link.
 *    B) Or use gviz / export pattern (sheet must be viewable by link):
 *       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
 * 4. Paste that URL into SHEET_CSV_URL below.
 * 5. Reload progress page. CORS: Google export/publish CSV usually works from
 *    browser fetch; if blocked, host a mirror or use a CORS-friendly publish URL.
 *
 * Empty SHEET_CSV_URL → local editable grid (localStorage), with on-screen note.
 *
 * WEEK9_DEFAULTS: only fill empty week-9 cells (never overwrite user text).
 */
(function (global) {
  "use strict";

  global.ProgressConfig = {
    /** Published CSV / export URL — leave "" until ready */
    SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFHMUA1qKnAvReYlkLGCvwYIHcDwPeUwZBgAukORsEtFOCKhmApf5m4gJzTfJ_cOO_Onmh0Jy_cAMe/pub?gid=244078639&single=true&output=csv",

    WEEK_COUNT: 18,

    /** Six classes for progress matrix (includes 1C — unlike 龍虎榜) */
    CLASSES: [
      { id: "1a", short: "1A", days: "四、五" },
      { id: "1b", short: "1B", days: "三、五" },
      { id: "1c", short: "1C", days: "" },
      { id: "2a", short: "2A", days: "二、三" },
      { id: "2b", short: "2B", days: "二、三" },
      { id: "3b", short: "3B", days: "一、四" },
    ],

    /**
     * Soft seed for week 9 — applied only when that cell is empty.
     * 1A intentionally omitted（今日冇 Inno Tech／唔 seed 物料竹籤）.
     */
    WEEK9_DEFAULTS: {
      "1b": "物料工作紙＋竹籤整傢俬｜1B 班房 M104",
      "2a": "第二堂 DRAR（外間導師）｜W102",
      "1c": "教到 5.2B；重溫多邊形面積｜M103",
    },
  };
})(window);
