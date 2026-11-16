/**
 * 欠交功課 — published Google Sheet CSV.
 * No student names in this file.
 *
 * The gradebook lives in OneDrive / Excel. GitHub Pages cannot read SharePoint
 * from the browser (no CORS, no guest cookie). This page reads a published
 * Google Sheet CSV, same pattern as 進度表 and 龍虎榜.
 *
 * Sheet: 創科站·欠交功課
 *   id  1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs
 *   gid 906117278
 *   edit https://docs.google.com/spreadsheets/d/1BYQKXnFamJ4WZB4c1_dL1VLRz0iYq4W2JvHlNkl8hBs/edit#gid=906117278
 *
 * HOW TO PLUG THE CSV (the /pub link is not known yet):
 * 1. Open the sheet above → 檔案 → 共用 → 發佈到網路.
 * 2. Publish this worksheet. The dialog gives a 2PACX id. That id is not the
 *    spreadsheet id above, so it cannot be guessed.
 * 3. Paste the CSV publish URL into SHEET_CSV_URL, replacing PUBLISH_ID:
 *      https://docs.google.com/spreadsheets/d/e/<PUBLISH_ID>/pub?gid=906117278&single=true&output=csv
 *    (If the dialog shows /pubhtml, switch it to the CSV shape above.)
 * 4. Columns: 班別,班號,學生編號,姓名,功課
 *    One row per missing assignment (empty grade).
 *    0 is submitted, not missing. Exemption (any case) is not missing.
 *    退學 rows are omitted. 1C may put 學號 in 班號 and leave 學生編號 blank.
 *
 * Placeholder SHEET_CSV_URL → the page waits and does not invent a publish link.
 * A filled /pub?…&output=csv URL is fetched directly.
 * A filled /d/<id>/export?format=csv (or an edit link) also tries gviz, same as
 * the other staff sheets. SHEET_CSV_FALLBACK is optional.
 * Do not put secrets in this file.
 */
(function (global) {
  "use strict";

  global.MissingConfig = {
    /**
     * Official publish CSV is not known yet.
     * Replace PUBLISH_ID, or replace this whole string, after 發佈到網路.
     */
    SHEET_CSV_URL:
      "https://docs.google.com/spreadsheets/d/e/PUBLISH_ID/pub?gid=906117278&single=true&output=csv",

    /** Optional second CSV (another /pub or /export link). Leave "" until needed. */
    SHEET_CSV_FALLBACK: "",
  };
})(typeof window !== "undefined" ? window : globalThis);
