/**
 * 今日課堂／未完成 — hub 本機清單（唔存學生名）
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "innotech-staff-today-lessons-v1";
  var CLASS_OPTIONS = ["1A", "1B", "1C", "2A", "2B", "3B"];

  var DEFAULT_LESSONS = [
    {
      id: "seed-1b",
      class: "1B",
      content: "物料工作紙＋竹籤整傢俬",
      room: "1B 班房 M104",
      done: false,
    },
    {
      id: "seed-2a",
      class: "2A",
      content: "第二堂 DRAR（外間導師）",
      room: "W102",
      done: false,
    },
    {
      id: "seed-1c",
      class: "1C",
      content: "教到 5.2B；重溫多邊形面積",
      room: "M103",
      done: false,
    },
  ];

  function todayHK() {
    try {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
  }

  function uid() {
    return "l-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function cloneDefaults() {
    return DEFAULT_LESSONS.map(function (x) {
      return {
        id: x.id + "-" + todayHK(),
        class: x.class,
        content: x.content,
        room: x.room,
        done: !!x.done,
      };
    });
  }

  function loadState() {
    var today = todayHK();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.date === today && Array.isArray(data.items)) {
          return { date: today, items: data.items };
        }
      }
    } catch (e) {}
    return { date: today, items: cloneDefaults() };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function render(root, state) {
    var list = root.querySelector("[data-tl-list]");
    var empty = root.querySelector("[data-tl-empty]");
    if (!list) return;
    list.innerHTML = "";
    if (!state.items.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    state.items.forEach(function (item, idx) {
      var card = document.createElement("article");
      card.className = "tl-card" + (item.done ? " is-done" : "");

      var head = document.createElement("div");
      head.className = "tl-card__head";
      var badge = document.createElement("span");
      badge.className = "tl-badge";
      badge.textContent = item.class || "—";
      var room = document.createElement("span");
      room.className = "tl-room";
      room.textContent = item.room ? "課室 " + item.room : "課室未填";
      head.appendChild(badge);
      head.appendChild(room);

      var body = document.createElement("p");
      body.className = "tl-card__content";
      body.textContent = item.content || "";

      var actions = document.createElement("div");
      actions.className = "tl-card__actions";

      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "btn btn-sm" + (item.done ? " btn-ghost" : " btn-good");
      toggle.textContent = item.done ? "標為未完成" : "完成";
      toggle.addEventListener("click", function () {
        state.items[idx].done = !state.items[idx].done;
        saveState(state);
        render(root, state);
      });

      var del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-sm btn-danger";
      del.textContent = "刪除";
      del.addEventListener("click", function () {
        if (!confirm("刪除呢一堂？")) return;
        state.items.splice(idx, 1);
        saveState(state);
        render(root, state);
      });

      actions.appendChild(toggle);
      actions.appendChild(del);
      card.appendChild(head);
      card.appendChild(body);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  function bindForm(root, state) {
    var form = root.querySelector("[data-tl-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cls = form.querySelector("[name=class]");
      var content = form.querySelector("[name=content]");
      var room = form.querySelector("[name=room]");
      var c = (cls && cls.value) || "";
      var t = content ? String(content.value || "").trim() : "";
      var r = room ? String(room.value || "").trim() : "";
      if (!c || !t) {
        alert("請揀班別同填寫內容。");
        return;
      }
      state.items.push({ id: uid(), class: c, content: t, room: r, done: false });
      saveState(state);
      if (content) content.value = "";
      if (room) room.value = "";
      render(root, state);
    });
  }

  function mount(selector) {
    var root = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!root) return;
    var state = loadState();
    saveState(state);
    var dateEl = root.querySelector("[data-tl-date]");
    if (dateEl) dateEl.textContent = state.date;
    bindForm(root, state);
    render(root, state);
  }

  global.TodayLessons = {
    STORAGE_KEY: STORAGE_KEY,
    CLASS_OPTIONS: CLASS_OPTIONS,
    DEFAULT_LESSONS: DEFAULT_LESSONS,
    mount: mount,
    todayHK: todayHK,
  };
})(window);
