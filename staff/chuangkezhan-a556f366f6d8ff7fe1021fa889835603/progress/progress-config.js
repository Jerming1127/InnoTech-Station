/**
 * 課堂進度 — Google Sheet (read-only) + class×week matrix.
 *
 * HOW TO PLUG A SHEET CSV URL:
 * 1. Open your progress Google Sheet (school account).
 * 2. Layout expected (first sheet / gid you publish):
 *      Row 1 header: 班別, W1, W2, … W18   (or 第1週…第18週 — see parser)
 *      Rows: 1A, 1B, 1C, 2A, 2B, 3B  (first column = class short name)
 *      Cells = week progress text (plain).
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
 */
(function (global) {
  "use strict";

  global.ProgressConfig = {
    /** Published CSV / export URL — leave "" until ready */
    SHEET_CSV_URL: "",

    WEEK_COUNT: 18,

    /** Six classes for progress matrix (includes 1C — unlike 農虎榜) */
    CLASSES: [
      { id: "1a", short: "1A", days: "四、五" },
      { id: "1b", short: "1B", days: "三、五" },
      { id: "1c", short: "1C", days: "" },
      { id: "2a", short: "2A", days: "二、三" },
      { id: "2b", short: "2B", days: "二、三" },
      { id: "3b", short: "3B", days: "一、四" },
    ],
  };
})(window);
