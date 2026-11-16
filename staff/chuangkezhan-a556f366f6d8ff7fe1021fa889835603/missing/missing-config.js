/**
 * 欠交功課 — Google Sheet CSV.
 * No student names in this file.
 *
 * The gradebook lives in OneDrive / Excel. GitHub Pages cannot read SharePoint
 * from the browser (no CORS, no guest cookie). This page reads a Google Sheet
 * CSV, same pattern as 進度表 and 龍虎榜.
 *
 * Sheet: 創科站·欠交功課
 *   id  1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs
 *   gid 906117278
 *   edit https://docs.google.com/spreadsheets/d/1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs/edit#gid=906117278
 *
 * The page reads this gviz CSV from spreadsheet id
 * 1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs, gid 906117278.
 *
 * Columns: 班別,班號,學生編號,姓名,功課
 *   One row per missing assignment (empty grade).
 *   0 is submitted, not missing. Exemption (any case) is not missing.
 *   退學 rows are omitted. 1C may put 學號 in 班號 and leave 學生編號 blank.
 *
 * A filled gviz URL (tqx=out:csv) is fetched directly.
 * A filled /pub?…&output=csv URL is fetched directly.
 * A filled /d/<id>/export?format=csv (or an edit link) also tries gviz, same as
 * the other staff sheets. SHEET_CSV_FALLBACK is optional.
 * Do not put secrets in this file.
 */
(function (global) {
  "use strict";

  global.MissingConfig = {
    /** gviz CSV: spreadsheet id 1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs, gid 906117278. */
    SHEET_CSV_URL:
      "https://docs.google.com/spreadsheets/d/1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs/gviz/tq?tqx=out:csv&gid=906117278",

    /** Optional second CSV (another /pub or /export link). Leave "" until needed. */
    SHEET_CSV_FALLBACK: "",
  };
})(typeof window !== "undefined" ? window : globalThis);
