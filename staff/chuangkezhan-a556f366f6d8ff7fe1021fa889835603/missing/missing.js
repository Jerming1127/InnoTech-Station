/**
 * 欠交功課 — parse a published gradebook CSV and group it for staff.
 * No student names in this file.
 *
 * A row counts as missing only when 功課 is a real assignment title.
 * 0 / 0.0 (including fullwidth ０) is submitted. Exemption (any case) is not missing.
 * A student is omitted entirely when 姓名 or any extra cell contains 退學 / 退学.
 */
(function (global) {
  "use strict";

  var CLASS_ORDER = ["1A", "1B", "1C", "2A", "2B", "3B"];

  function foldWidth(value) {
    return String(value == null ? "" : value).replace(/[！-～]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    });
  }

  function parseCsv(text) {
    var rows = [];
    var i = 0;
    var field = "";
    var row = [];
    var inQ = false;
    text = String(text || "").replace(/^\uFEFF/, "");
    while (i < text.length) {
      var ch = text[i];
      if (inQ) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQ = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }
      if (ch === '"') {
        inQ = true;
        i++;
        continue;
      }
      if (ch === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length > 1 || (row[0] && String(row[0]).trim())) rows.push(row);
        row = [];
        i++;
        continue;
      }
      field += ch;
      i++;
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function headerToken(value) {
    return foldWidth(value).replace(/\s+/g, "").toLowerCase();
  }

  function headerField(token) {
    var map = {
      "班別": "classId",
      "班級": "classId",
      "class": "classId",
      "班號": "no",
      "學號": "no",
      "学号": "no",
      "座號": "no",
      "座号": "no",
      "學生編號": "studentId",
      "学生编号": "studentId",
      "studentid": "studentId",
      "姓名": "name",
      "學生": "name",
      "学生": "name",
      "name": "name",
      "功課": "homework",
      "功課名稱": "homework",
      "作業": "homework",
      "作业": "homework",
      "homework": "homework",
      "assignment": "homework",
    };
    return map[token] || "";
  }

  function headerRank(token, field) {
    if (field === "no" && token === "班號") return 2;
    return 1;
  }

  function mapHeader(header) {
    var cols = { classId: -1, no: -1, studentId: -1, name: -1, homework: -1 };
    var used = {};
    var rank = {};
    for (var i = 0; i < header.length; i++) {
      var token = headerToken(header[i]);
      var field = headerField(token);
      if (!field) continue;
      var nextRank = headerRank(token, field);
      if (cols[field] >= 0 && nextRank <= (rank[field] || 0)) continue;
      if (cols[field] >= 0) delete used[cols[field]];
      cols[field] = i;
      used[i] = true;
      rank[field] = nextRank;
    }
    cols.used = used;
    return cols;
  }

  function findHeader(rows) {
    var limit = Math.min(rows.length, 6);
    for (var i = 0; i < limit; i++) {
      var cols = mapHeader(rows[i]);
      if (cols.classId >= 0 && cols.name >= 0 && cols.homework >= 0) {
        return { index: i, cols: cols };
      }
    }
    return null;
  }

  function cellAt(row, idx) {
    if (!row || idx < 0 || idx >= row.length || row[idx] == null) return "";
    return String(row[idx]).trim();
  }

  function normalizeClass(raw) {
    var s = foldWidth(raw).replace(/\s+/g, "").toUpperCase();
    var known = s.match(/(1A|1B|1C|2A|2B|3B)/);
    if (known) return known[1];
    if (/^[0-9]{1,2}[A-Z]$/.test(s)) return s;
    return "";
  }

  function normalizeNo(raw) {
    return foldWidth(raw).replace(/\s+/g, "").trim();
  }

  function cleanName(raw) {
    return String(raw || "")
      .replace(/[（(]\s*退學\s*[）)]/g, "")
      .replace(/[（(]\s*退学\s*[）)]/g, "")
      .replace(/退學|退学/g, "")
      .trim();
  }

  function isZeroGrade(value) {
    var s = foldWidth(value).trim();
    return /^0+(?:\.0+)?$/.test(s);
  }

  function isExemption(value) {
    return /^exemption$/i.test(foldWidth(value).trim());
  }

  function isMissingTitle(value) {
    var s = foldWidth(value).trim();
    if (!s) return false;
    if (isZeroGrade(s)) return false;
    if (isExemption(s)) return false;
    return true;
  }

  function mentionsWithdrawn(value) {
    return /退學|退学/.test(String(value || ""));
  }

  function noKey(no) {
    var s = String(no || "");
    if (/^\d+$/.test(s)) return String(parseInt(s, 10));
    return s;
  }

  function personKey(row) {
    if (row.studentId) return row.classId + "\tid:" + row.studentId;
    return row.classId + "\tno:" + noKey(row.no) + "\t" + cleanName(row.name);
  }

  function markWithdrawn(set, row) {
    set[personKey(row)] = true;
    if (row.studentId) set[row.classId + "\tid:" + row.studentId] = true;
    if (row.no) set[row.classId + "\tseat:" + noKey(row.no)] = true;
  }

  function isMarkedWithdrawn(set, row) {
    if (set[personKey(row)]) return true;
    if (row.studentId && set[row.classId + "\tid:" + row.studentId]) return true;
    if (row.no && set[row.classId + "\tseat:" + noKey(row.no)]) return true;
    return false;
  }

  function classRank(id) {
    var idx = CLASS_ORDER.indexOf(id);
    return idx < 0 ? 100 : idx;
  }

  function noValue(no) {
    var m = String(no || "").match(/\d+/);
    if (!m) return 100000;
    return parseInt(m[0], 10);
  }

  function cmpPerson(a, b) {
    var d = noValue(a.no) - noValue(b.no);
    if (d) return d;
    if (a.no !== b.no) return a.no < b.no ? -1 : 1;
    return String(a.name).localeCompare(String(b.name), "zh-Hant");
  }

  function cmpClass(a, b) {
    var d = classRank(a) - classRank(b);
    if (d) return d;
    return String(a).localeCompare(String(b));
  }

  /**
   * @returns {Array<{classId:string,no:string,studentId:string,name:string,homework:string}>}
   */
  function parseMissingCsv(text) {
    var grid = parseCsv(text);
    if (!grid.length) throw new Error("CSV 空白");
    var header = findHeader(grid);
    if (!header) throw new Error("CSV 未見欄位：班別、姓名、功課");
    var cols = header.cols;
    var pending = [];
    var withdrawn = {};

    for (var r = header.index + 1; r < grid.length; r++) {
      var line = grid[r];
      var record = {
        classId: normalizeClass(cellAt(line, cols.classId)),
        no: cols.no >= 0 ? normalizeNo(cellAt(line, cols.no)) : "",
        studentId: cols.studentId >= 0 ? cellAt(line, cols.studentId) : "",
        name: cellAt(line, cols.name),
        homework: cellAt(line, cols.homework),
      };
      if (!record.classId) continue;
      var extras = [];
      for (var c = 0; c < line.length; c++) {
        if (cols.used[c]) continue;
        var extra = cellAt(line, c);
        if (extra) extras.push(extra);
      }
      var gone = mentionsWithdrawn(record.name);
      if (!gone) {
        for (var e = 0; e < extras.length; e++) {
          if (mentionsWithdrawn(extras[e])) {
            gone = true;
            break;
          }
        }
      }
      if (gone) {
        markWithdrawn(withdrawn, record);
        continue;
      }
      if (!cleanName(record.name) || !isMissingTitle(record.homework)) continue;
      record.name = cleanName(record.name);
      pending.push(record);
    }

    var seen = {};
    var out = [];
    pending.forEach(function (row) {
      if (isMarkedWithdrawn(withdrawn, row)) return;
      var key = row.classId + "\t" + personKey(row) + "\t" + row.homework;
      if (seen[key]) return;
      seen[key] = true;
      out.push(row);
    });
    return out;
  }

  function groupByHomework(rows) {
    var classes = {};
    var order = [];
    (rows || []).forEach(function (row, index) {
      if (!classes[row.classId]) {
        classes[row.classId] = { classId: row.classId, count: 0, assignments: {}, assignOrder: [] };
        order.push(row.classId);
      }
      var bucket = classes[row.classId];
      bucket.count += 1;
      if (!bucket.assignments[row.homework]) {
        bucket.assignments[row.homework] = { homework: row.homework, count: 0, people: [], first: index };
        bucket.assignOrder.push(row.homework);
      }
      var group = bucket.assignments[row.homework];
      group.count += 1;
      group.people.push({ no: row.no, name: row.name });
    });
    order.sort(cmpClass);
    return order.map(function (id) {
      var bucket = classes[id];
      var assignments = bucket.assignOrder.map(function (title) {
        var group = bucket.assignments[title];
        group.people.sort(cmpPerson);
        return { homework: group.homework, count: group.count, people: group.people };
      });
      return { classId: id, count: bucket.count, assignments: assignments };
    });
  }

  function groupByStudent(rows) {
    var classes = {};
    var order = [];
    (rows || []).forEach(function (row) {
      if (!classes[row.classId]) {
        classes[row.classId] = { classId: row.classId, count: 0, students: {} };
        order.push(row.classId);
      }
      var bucket = classes[row.classId];
      bucket.count += 1;
      var key = personKey(row);
      if (!bucket.students[key]) {
        bucket.students[key] = {
          no: row.no,
          name: row.name,
          count: 0,
          homework: [],
        };
      }
      var student = bucket.students[key];
      student.count += 1;
      student.homework.push(row.homework);
    });
    order.sort(cmpClass);
    return order.map(function (id) {
      var bucket = classes[id];
      var students = Object.keys(bucket.students).map(function (key) {
        return bucket.students[key];
      });
      students.sort(cmpPerson);
      return { classId: id, count: bucket.count, students: students };
    });
  }

  function configuredUrl(raw) {
    var u = String(raw || "").trim();
    if (!u) return "";
    if (/PUBLISH_ID|PASTE_PUBLISH|REPLACE_ME|REPLACE_WITH/i.test(u)) return "";
    if (!/^https:\/\/docs\.google\.com\/spreadsheets\//i.test(u)) return "";
    return u;
  }

  function looksLikeCsvUrl(url) {
    return /output=csv|format=csv|tqx=out:csv/i.test(url);
  }

  function parseSheetRef(url) {
    var u = String(url || "");
    var id = null;
    var gid = null;
    var m = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (m && m[1] !== "e") id = m[1];
    var g = u.match(/[?&#]gid=([0-9]+)/);
    if (g) gid = g[1];
    return { id: id, gid: gid };
  }

  function collectSheetUrls(cfg) {
    cfg = cfg || {};
    var urls = [];
    var ref = { id: null, gid: null };
    function add(u) {
      if (!u || urls.indexOf(u) >= 0) return;
      urls.push(u);
    }
    [cfg.SHEET_CSV_URL, cfg.SHEET_CSV_FALLBACK].forEach(function (raw) {
      var u = configuredUrl(raw);
      if (!u) return;
      var parsed = parseSheetRef(u);
      if (parsed.id) ref = parsed;
      if (looksLikeCsvUrl(u)) add(u);
      if (!parsed.id) return;
      add(
        "https://docs.google.com/spreadsheets/d/" +
          parsed.id +
          "/export?format=csv" +
          (parsed.gid != null ? "&gid=" + parsed.gid : "")
      );
      add(
        "https://docs.google.com/spreadsheets/d/" +
          parsed.id +
          "/gviz/tq?tqx=out:csv" +
          (parsed.gid != null ? "&gid=" + parsed.gid : "")
      );
    });
    return { urls: urls, ref: ref };
  }

  function csvEscapeCell(s) {
    s = String(s == null ? "" : s);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function assertCsvText(text) {
    text = String(text || "");
    var head = text.slice(0, 200).replace(/^\uFEFF/, "");
    if (/^\s*</.test(head) || /accounts\.google\.com/i.test(head) || /ServiceLogin/i.test(head)) {
      throw new Error("需要登入／尚未發佈 CSV");
    }
    if (!head.trim()) throw new Error("CSV 空白");
    return text;
  }

  function fetchCsvText(url) {
    return fetch(url, { cache: "no-store", mode: "cors", credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(assertCsvText);
  }

  function gvizTableToCsv(data) {
    var table = data && data.table;
    if (!table) throw new Error("gviz 無 table");
    function cellVal(c) {
      if (!c) return "";
      if (c.f != null && String(c.f) !== "") return String(c.f);
      if (c.v == null) return "";
      return String(c.v);
    }
    var cols = table.cols || [];
    var rows = table.rows || [];
    var headers = cols.map(function (col) {
      if (!col || col.label == null) return "";
      return String(col.label);
    });
    var start = 0;
    if (headers.every(function (h) { return !String(h).trim(); }) && rows.length) {
      headers = (rows[0].c || []).map(cellVal);
      start = 1;
    }
    var lines = [headers.map(csvEscapeCell).join(",")];
    for (var i = start; i < rows.length; i++) {
      var cells = rows[i].c || [];
      var vals = [];
      for (var j = 0; j < headers.length; j++) vals.push(csvEscapeCell(cellVal(cells[j])));
      lines.push(vals.join(","));
    }
    return assertCsvText(lines.join("\n"));
  }

  function fetchGvizJsonp(sheetId, gid) {
    return new Promise(function (resolve, reject) {
      var cb = "_missingGviz" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      var script = document.createElement("script");
      var done = false;
      function cleanup() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { delete global[cb]; } catch (e) { global[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      var timer = setTimeout(function () {
        cleanup();
        reject(new Error("gviz JSONP timeout"));
      }, 20000);
      global[cb] = function (payload) {
        cleanup();
        try {
          resolve(gvizTableToCsv(payload));
        } catch (err) {
          reject(err);
        }
      };
      script.async = true;
      script.onerror = function () {
        cleanup();
        reject(new Error("gviz JSONP network error"));
      };
      var src =
        "https://docs.google.com/spreadsheets/d/" +
        encodeURIComponent(sheetId) +
        "/gviz/tq?tqx=out:json;responseHandler:" +
        cb;
      if (gid != null && gid !== "") src += "&gid=" + encodeURIComponent(gid);
      script.src = src;
      document.head.appendChild(script);
    });
  }

  function loadSheetCsvText(cfg) {
    var pack = collectSheetUrls(cfg);
    function nextFetch(i, lastErr) {
      if (i >= pack.urls.length) {
        if (pack.ref.id) {
          return fetchGvizJsonp(pack.ref.id, pack.ref.gid).catch(function (err) {
            throw lastErr || err;
          });
        }
        return Promise.reject(lastErr || new Error("Failed to fetch"));
      }
      return fetchCsvText(pack.urls[i]).catch(function (err) {
        return nextFetch(i + 1, err);
      });
    }
    return nextFetch(0, null);
  }

  var mode = "homework";
  var classFilter = "all";
  var rows = [];
  var status = "loading";
  var booted = false;

  function filterRows(list, classId) {
    var source = list || [];
    var id = classId == null ? classFilter : classId;
    if (!id || id === "all") return source.slice();
    var out = [];
    for (var i = 0; i < source.length; i++) {
      if (source[i] && source[i].classId === id) out.push(source[i]);
    }
    return out;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function showNote(msg, isErr) {
    var note = el("sheet-note");
    if (!note) return;
    if (!msg) {
      note.hidden = true;
      note.textContent = "";
      note.classList.remove("is-err");
      return;
    }
    note.hidden = false;
    note.textContent = msg;
    note.classList.toggle("is-err", !!isErr);
  }

  function setStamp(text) {
    var stamp = el("mode-stamp");
    if (stamp) stamp.textContent = text;
  }

  function syncTabs() {
    var hw = el("miss-by-homework");
    var st = el("miss-by-student");
    if (hw) {
      hw.classList.toggle("is-active", mode === "homework");
      hw.setAttribute("aria-selected", mode === "homework" ? "true" : "false");
    }
    if (st) {
      st.classList.toggle("is-active", mode === "student");
      st.setAttribute("aria-selected", mode === "student" ? "true" : "false");
    }
  }

  function syncClassTabs() {
    var bar = el("miss-classes");
    if (!bar) return;
    var buttons = bar.querySelectorAll("[data-class]");
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute("data-class") === classFilter;
      buttons[i].classList.toggle("is-active", on);
      buttons[i].setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  function appendCount(parent, n) {
    var count = document.createElement("span");
    count.className = "miss-count";
    count.textContent = String(n);
    parent.appendChild(count);
  }

  function appendPerson(list, person) {
    var li = document.createElement("li");
    if (person.no) {
      var no = document.createElement("span");
      no.className = "miss-no";
      no.textContent = person.no;
      li.appendChild(no);
    }
    var name = document.createElement("span");
    name.textContent = person.name;
    li.appendChild(name);
    list.appendChild(li);
  }

  function renderHomeworkClass(cls) {
    var section = document.createElement("section");
    section.className = "miss-class";
    section.setAttribute("aria-label", cls.classId);
    var head = document.createElement("div");
    head.className = "miss-class__head";
    var h2 = document.createElement("h2");
    h2.textContent = cls.classId;
    head.appendChild(h2);
    appendCount(head, cls.count);
    section.appendChild(head);
    var body = document.createElement("div");
    body.className = "miss-assignments";
    cls.assignments.forEach(function (group) {
      var box = document.createElement("div");
      box.className = "miss-group";
      var title = document.createElement("div");
      title.className = "miss-group__title";
      var label = document.createElement("span");
      label.className = "miss-group__label";
      label.textContent = group.homework;
      title.appendChild(label);
      appendCount(title, group.count);
      var list = document.createElement("ul");
      list.className = "miss-people";
      group.people.forEach(function (person) { appendPerson(list, person); });
      box.appendChild(title);
      box.appendChild(list);
      body.appendChild(box);
    });
    section.appendChild(body);
    return section;
  }

  function renderStudentClass(cls) {
    var section = document.createElement("section");
    section.className = "miss-class";
    section.setAttribute("aria-label", cls.classId);
    var head = document.createElement("div");
    head.className = "miss-class__head";
    var h2 = document.createElement("h2");
    h2.textContent = cls.classId;
    head.appendChild(h2);
    appendCount(head, cls.count);
    section.appendChild(head);
    var body = document.createElement("div");
    body.className = "miss-students";
    cls.students.forEach(function (student) {
      var card = document.createElement("article");
      card.className = "miss-student";
      var title = document.createElement("div");
      title.className = "miss-student__head";
      var who = document.createElement("span");
      who.className = "miss-who";
      if (student.no) {
        var no = document.createElement("span");
        no.className = "miss-no";
        no.textContent = student.no;
        who.appendChild(no);
      }
      who.appendChild(document.createTextNode(student.name));
      title.appendChild(who);
      appendCount(title, student.count);
      var list = document.createElement("ul");
      list.className = "miss-titles";
      student.homework.forEach(function (titleText) {
        var li = document.createElement("li");
        li.textContent = titleText;
        list.appendChild(li);
      });
      card.appendChild(title);
      card.appendChild(list);
      body.appendChild(card);
    });
    section.appendChild(body);
    return section;
  }

  function paint() {
    var board = el("miss-board");
    var empty = el("miss-empty");
    if (!board) return;
    board.innerHTML = "";
    var visible = filterRows(rows);
    var groups = mode === "student" ? groupByStudent(visible) : groupByHomework(visible);
    groups.forEach(function (cls) {
      board.appendChild(mode === "student" ? renderStudentClass(cls) : renderHomeworkClass(cls));
    });
    if (empty) empty.hidden = !(status === "ready" && !groups.length);
    syncTabs();
    syncClassTabs();
  }

  function setClass(next) {
    var id = String(next || "");
    classFilter = CLASS_ORDER.indexOf(id) >= 0 ? id : "all";
    paint();
  }

  function setMode(next) {
    mode = next === "student" ? "student" : "homework";
    paint();
  }

  function setRows(next) {
    rows = Array.isArray(next) ? next : [];
    status = "ready";
    showNote("");
    setStamp("來源：Google Sheet");
    paint();
  }

  function enterUnconfigured() {
    rows = [];
    status = "unconfigured";
    setStamp("未設定 CSV");
    showNote("請將「發佈到網路」CSV 貼入 missing-config.js。");
    paint();
  }

  function enterFailure(err) {
    if (status !== "ready") {
      rows = [];
      status = "error";
    }
    setStamp("未能載入");
    showNote(
      "無法載入 Sheet（" +
        (err && err.message ? err.message : "錯誤") +
        "）。請確認已「發佈到網路」，連結形狀為 /pub?gid=&single=true&output=csv，然後撳「重新載入 Sheet」。",
      true
    );
    paint();
  }

  function load() {
    var cfg = global.MissingConfig || {};
    var pack = collectSheetUrls(cfg);
    if (!pack.urls.length && !pack.ref.id) {
      enterUnconfigured();
      return;
    }
    setStamp("載入中…");
    loadSheetCsvText(cfg)
      .then(function (text) {
        setRows(parseMissingCsv(text));
      })
      .catch(enterFailure);
  }

  function boot() {
    if (booted) return;
    booted = true;
    var logout = el("btn-logout");
    if (logout) {
      logout.addEventListener("click", function () {
        if (global.StaffAuth) global.StaffAuth.logout();
        location.reload();
      });
    }
    var reload = el("btn-reload-sheet");
    if (reload) {
      var pack = collectSheetUrls(global.MissingConfig || {});
      reload.hidden = !pack.urls.length && !pack.ref.id;
      reload.addEventListener("click", load);
    }
    var byHw = el("miss-by-homework");
    var bySt = el("miss-by-student");
    if (byHw) byHw.addEventListener("click", function () { setMode("homework"); });
    if (bySt) bySt.addEventListener("click", function () { setMode("student"); });
    var classBar = el("miss-classes");
    if (classBar) {
      classBar.addEventListener("click", function (ev) {
        var node = ev.target;
        while (node && node !== classBar) {
          if (node.getAttribute && node.getAttribute("data-class")) {
            setClass(node.getAttribute("data-class"));
            return;
          }
          node = node.parentNode;
        }
      });
    }
    load();
  }

  global.MissingHomework = {
    parse: parseMissingCsv,
    groupByHomework: groupByHomework,
    groupByStudent: groupByStudent,
    filterRows: filterRows,
    setClass: setClass,
    collectSheetUrls: collectSheetUrls,
    configuredUrl: configuredUrl,
    setRows: setRows,
    setMode: setMode,
    boot: boot,
  };
})(typeof window !== "undefined" ? window : globalThis);
