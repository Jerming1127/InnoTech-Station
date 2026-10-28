/**
 * 一週時間表 seed
 * - 鎖匙：只填已知（1A→M105、1B→M104；其餘空）
 * - Inno Tech：唔寫 ITLC；1A→M105、1B→M104；日曆有 W102 保留 W102；其他班空
 * - 小息：暫時二、五；小息一＝主人當值
 */
(function (global) {
  "use strict";

  global.TimetableConfig = {
    KEYS: [
      { class: "1A", room: "M105" },
      { class: "1B", room: "M104" },
      { class: "1C", room: "" },
      { class: "2A", room: "" },
      { class: "2B", room: "" },
      { class: "3B", room: "" },
    ],

    BREAK_NOTE:
      "小息一：主人需要當值。暫時標記：逢星期二、逢星期五為小息當值日（時間欄可稍後再填）。",

    BREAK_DAYS: ["tue", "fri"],

    DAYS: [
      {
        key: "sun",
        label: "星期日",
        kind: "overview",
      },
      {
        key: "mon",
        label: "逢星期一",
        kind: "schedule",
        slots: [
          { time: "08:05–08:25", class: "1A", subject: "Morning Assembly／MRS", room: "M105" },
          { time: "08:25–09:35", class: "3B", subject: "Inno Tech", room: "W102" },
          { time: "13:40–14:50", class: "1C", subject: "Math", room: "M103" },
          { time: "15:35–15:45", class: "1A", subject: "CTP", room: "M105" },
        ],
      },
      {
        key: "tue",
        label: "逢星期二",
        kind: "schedule",
        breakDuty: true,
        slots: [
          { time: "08:05–08:25", class: "1A", subject: "MRS", room: "M105" },
          { time: "08:25–09:35", class: "2B", subject: "Inno Tech", room: "" },
          { time: "11:20–12:30", class: "2A", subject: "Inno Tech", room: "" },
          { time: "14:15–14:50", class: "1C", subject: "Math", room: "M103" },
          { time: "15:00–15:35", class: "S1", subject: "Math CLP", room: "" },
          { time: "15:35–15:45", class: "1A", subject: "CTP", room: "M105" },
        ],
      },
      {
        key: "wed",
        label: "逢星期三",
        kind: "schedule",
        slots: [
          { time: "08:05–08:25", class: "1A", subject: "MRS", room: "M105" },
          { time: "08:25–09:35", class: "2B", subject: "Inno Tech", room: "W102" },
          { time: "10:00–11:10", class: "1B", subject: "Inno Tech", room: "W102" },
          { time: "13:40–14:50", class: "2A", subject: "Inno Tech", room: "W102" },
          { time: "15:00–15:35", class: "1C", subject: "Math", room: "M103" },
          { time: "15:35–15:45", class: "1A", subject: "CTP", room: "M105" },
        ],
      },
      {
        key: "thu",
        label: "逢星期四",
        kind: "schedule",
        slots: [
          { time: "08:05–08:25", class: "1A", subject: "MRS", room: "M105" },
          { time: "08:25–09:35", class: "1A", subject: "Inno Tech", room: "M105" },
          { time: "10:00–11:10", class: "3B", subject: "Inno Tech", room: "" },
          { time: "11:55–12:30", class: "1C", subject: "Math", room: "M103" },
          { time: "13:40–14:15", class: "1A", subject: "Life Ed", room: "M105" },
          { time: "14:15–15:35", class: "1A", subject: "MIP／Assembly", room: "M105" },
          { time: "15:35–15:45", class: "1A", subject: "CTP", room: "M105" },
        ],
      },
      {
        key: "fri",
        label: "逢星期五",
        kind: "schedule",
        breakDuty: true,
        slots: [
          { time: "08:05–08:25", class: "1A", subject: "CTP", room: "M105" },
          { time: "10:00–11:10", class: "1B", subject: "Inno Tech", room: "M104" },
          { time: "11:55–12:30", class: "1C", subject: "Math", room: "M103" },
          { time: "13:40–14:50", class: "1A", subject: "Inno Tech", room: "W102" },
          { time: "15:35–15:45", class: "1A", subject: "CTP", room: "M105" },
        ],
      },
    ],
  };
})(window);
