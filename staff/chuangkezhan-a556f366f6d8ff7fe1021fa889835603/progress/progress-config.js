/**
 * 上課日子教學進度表 — Google Sheet (read-only) + week matrix.
 * No student names in this file.
 *
 * HOW TO PLUG A SHEET (share-link，唔使 Publish to web):
 * 1. Open your school Google Sheet for 進度表 (學校帳戶).
 * 2. Expected layout: week rows × class columns, or week / class / progress text.
 *      (Legacy class×week CSV still parsed as fallback.)
 * 3. Share →「知道連結的使用者可檢視」(Anyone with the link → Viewer).
 *    唔使 File → Publish to web。
 * 4. Paste export URL into SHEET_CSV_URL:
 *       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
 * 5. Reload progress page. Tries: fetch export → fetch gviz CSV → gviz JSONP.
 *
 * Empty SHEET_CSV_URL → local editable grid (localStorage), with on-screen note.
 *
 * WEEK9_DEFAULTS: only fill empty week-9 cells (never overwrite user text).
 */
(function (global) {
  "use strict";

  global.ProgressConfig = {
    /** Share-link export URL (Anyone with link can view) — leave "" until ready */
    SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/1dDLJ5Gfi2n9v9m4ylofpfwSBSEhctOYLc0S5SxOwyVU/export?format=csv&gid=915310866",

    /** Optional last-resort publish CSV if share-link not set yet (can clear once Share works) */
    SHEET_CSV_FALLBACK: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFHMUA1qKnAvReYlkLGCvwYIHcDwPeUwZBgAukORsEtFOCKhmApf5m4gJzTfJ_cOO_Onmh0Jy_cAMe/pub?gid=915310866&single=true&output=csv",

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
