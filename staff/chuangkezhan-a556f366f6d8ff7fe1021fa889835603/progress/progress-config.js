/**
 * 上課日子教學進度表 — Google Sheet + week × class × track matrix.
 * No student names in this file.
 *
 * HOW TO PLUG A SHEET (share-link，唔使 Publish to web):
 * 1. Open your school Google Sheet for 進度表 (學校帳戶).
 * 2. Expected layout — two header rows, then W1…W18:
 *      Row1: 週次,1A,1A,1B,1B,2A,2A,2B,2B,3B,3B,1C
 *        Merged cells: class name in the first of the two columns, second cell empty.
 *      Row2: ,電腦,工場,電腦,工場,電腦,工場,電腦,工場,電腦,工場,數學
 *      1C is a single column (header 「1C」 or 「1C 數學」, track 數學) — no 電腦/工場 split.
 *    Legacy single header 週次,1A,1B,2A,2B,3B,1C is still read:
 *      1B → 工場, 2A → 電腦, 1C → 數學; other classes stay visible under 電腦.
 *    (Legacy class×week CSV still parsed as fallback.)
 * 3. Share →「知道連結的使用者可檢視」(Anyone with the link → Viewer).
 *    唔使 File → Publish to web。
 * 4. Paste export URL into SHEET_CSV_URL:
 *       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
 * 5. Reload progress page. Tries: fetch export → fetch gviz CSV → gviz JSONP.
 *
 * Empty SHEET_CSV_URL → local editable grid (localStorage).
 * WRITE (optional): deploy ../apps-script/Code.gs → set APPS_SCRIPT_URL + WRITE_TOKEN.
 * Empty APPS_SCRIPT_URL → Sheet 仍可讀，畫面顯示「未接寫入」。
 * setCell sends { week, class, track, text } so 電腦／工場／數學 write to the right column.
 *
 * WEEK9_DEFAULTS: only fill empty week-9 cells in local mode (never overwrite text).
 *   1B → 工場, 2A → 電腦 (W102), 1C → 數學.
 */
(function (global) {
  "use strict";

  global.ProgressConfig = {
    /** Share-link export URL (Anyone with link can view) — leave "" until ready */
    SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/1dDLJ5Gfi2n9v9m4ylofpfwSBSEhctOYLc0S5SxOwyVU/export?format=csv&gid=915310866",

    /** Optional last-resort publish CSV if share-link not set yet (can clear once Share works) */
    SHEET_CSV_FALLBACK: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFHMUA1qKnAvReYlkLGCvwYIHcDwPeUwZBgAukORsEtFOCKhmApf5m4gJzTfJ_cOO_Onmh0Jy_cAMe/pub?gid=915310866&single=true&output=csv",

    /**
     * Apps Script Web App URL (…/exec) — leave "" until deployed.
     * Deploy steps: ../apps-script/README.md
     * Shared with longhu-config.js.
     */
    APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby8qrwfMvggGF5rZM9bem_Pvskr1JYGk17ea7eeE1wj_zQtQDqL5_JRo3tJ4C2av-jb/exec",

    /**
     * Shared write token — must match Apps Script property WRITE_TOKEN.
     * Leave "" / do not commit real secrets.
     */
    WRITE_TOKEN: "1b8cfcf5dc36e8df196448966c640b3d",

    WEEK_COUNT: 18,

    /**
     * Six classes. InnoTech classes split into 電腦 + 工場.
     * 1C is maths only — one column, header 「1C 數學」.
     * Order matches the sheet: 1A 1B 2A 2B 3B, then 1C.
     */
    CLASSES: [
      { id: "1a", short: "1A", days: "四、五", tracks: ["電腦", "工場"] },
      { id: "1b", short: "1B", days: "三、五", tracks: ["電腦", "工場"] },
      { id: "2a", short: "2A", days: "二、三", tracks: ["電腦", "工場"] },
      { id: "2b", short: "2B", days: "二、三", tracks: ["電腦", "工場"] },
      { id: "3b", short: "3B", days: "一、四", tracks: ["電腦", "工場"] },
      { id: "1c", short: "1C", days: "", tracks: ["數學"], header: "1C 數學" },
    ],

    /**
     * Where a legacy single-column value is shown after the split.
     * 1B workshop (傢俬 / M104), 2A computer room (W102), 1C maths.
     * Other classes stay visible under 電腦 — nothing is invented.
     */
    LEGACY_TRACK: {
      "1a": "電腦",
      "1b": "工場",
      "2a": "電腦",
      "2b": "電腦",
      "3b": "電腦",
      "1c": "數學",
    },

    /**
     * Soft seed for week 9 — local mode only, and only when that cell is empty.
     * 1A intentionally omitted（今日冇 Inno Tech／唔 seed 物料竹籤）.
     */
    WEEK9_DEFAULTS: {
      "1b": { "工場": "物料工作紙＋竹籤整傢俬｜1B 班房 M104" },
      "2a": { "電腦": "第二堂 DRAR（外間導師）｜W102" },
      "1c": { "數學": "教到 5.2B；重溫多邊形面積｜M103" },
    },
  };
})(window);
