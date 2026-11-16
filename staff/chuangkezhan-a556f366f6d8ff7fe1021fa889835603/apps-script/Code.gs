/**
 * 創科站職員區 — Google Apps Script Web App
 * 供靜態 GitHub Pages（登入後）寫入龍虎榜／進度 Sheet。
 *
 * Script Properties（專案設定 → 指令碼屬性）必填：
 *   WRITE_TOKEN          = 與 longhu-config.js / progress-config.js 的 WRITE_TOKEN 相同（唔好用 REPLACE_ME）
 *   LONGHU_SHEET_ID      = 龍虎榜試算表 ID
 *   LONGHU_GID           = 龍虎榜分頁 gid（例如 255525742）
 *   PROGRESS_SHEET_ID    = 進度表試算表 ID
 *   PROGRESS_GID         = 進度表分頁 gid（例如 915310866）
 *
 * 前端請用 Content-Type: text/plain 送 JSON（避開 CORS preflight）。
 * 唔好喺 repo 放真實 token。
 */

var ALLOWED_CLASSES_LONGHU = { '1A': 1, '1B': 1, '2A': 1, '2B': 1, '3B': 1 };
var ALLOWED_CLASSES_PROGRESS = { '1A': 1, '1B': 1, '1C': 1, '2A': 1, '2B': 1, '3B': 1 };

function doGet(e) {
  return jsonOut_({
    ok: true,
    service: 'innotech-staff-write',
    boards: ['longhu', 'progress'],
    progressTracks: ['電腦', '工場', '數學'],
    hint: 'POST JSON {token, board, action, ...}'
  });
}

function doPost(e) {
  try {
    var body = parseBody_(e);
    assertToken_(body, e);
    var board = String(body.board || '').toLowerCase();
    var action = String(body.action || '').toLowerCase();

    if (board === 'longhu') {
      return jsonOut_(handleLonghu_(action, body));
    }
    if (board === 'progress') {
      return jsonOut_(handleProgress_(action, body));
    }
    return jsonOut_({ ok: false, error: 'unknown board' }, 400);
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message ? err.message : err) }, 400);
  }
}

function handleLonghu_(action, body) {
  var sh = openSheetByGid_(prop_('LONGHU_SHEET_ID'), prop_('LONGHU_GID'));
  var map = headerMap_(sh);
  requireCols_(map, ['學號', '姓名', '班別', '分數']);

  if (action === 'award') {
    var pts = Number(body.points);
    if (!(pts >= 1 && pts <= 20)) throw new Error('points 必須 1–20');
    var row = findLonghuRow_(sh, map, body);
    if (!row) throw new Error('搵唔到該同學（請核對學號或姓名+班別）');
    var cur = Number(sh.getRange(row, map['分數']).getValue()) || 0;
    var next = cur + pts;
    sh.getRange(row, map['分數']).setValue(next);
    return {
      ok: true,
      action: 'award',
      row: row,
      studentNo: String(sh.getRange(row, map['學號']).getValue() || ''),
      name: String(sh.getRange(row, map['姓名']).getValue() || ''),
      class: String(sh.getRange(row, map['班別']).getValue() || ''),
      score: next,
      added: pts,
      reason: body.reason || ''
    };
  }

  if (action === 'setscore' || action === 'set_score') {
    var score = Number(body.score != null ? body.score : body.points);
    if (isNaN(score) || score < 0) throw new Error('score 無效');
    var row2 = findLonghuRow_(sh, map, body);
    if (!row2) throw new Error('搵唔到該同學');
    sh.getRange(row2, map['分數']).setValue(score);
    return {
      ok: true,
      action: 'setScore',
      row: row2,
      score: score
    };
  }

  if (action === 'upsert') {
    var cls = normClass_(body.class || body.className);
    if (!ALLOWED_CLASSES_LONGHU[cls]) throw new Error('班別只接受 1A／1B／2A／2B／3B');
    var name = String(body.name || '').trim();
    if (!name) throw new Error('需要 name');
    var sno = String(body.studentNo || body.studentId || '').trim();
    var row3 = findLonghuRow_(sh, map, body);
    var score3 = body.score != null ? Number(body.score) : (body.points != null ? Number(body.points) : null);
    if (row3) {
      if (sno) sh.getRange(row3, map['學號']).setValue(sno);
      sh.getRange(row3, map['姓名']).setValue(name);
      sh.getRange(row3, map['班別']).setValue(cls);
      if (score3 != null && !isNaN(score3)) sh.getRange(row3, map['分數']).setValue(score3);
      return { ok: true, action: 'upsert', row: row3, created: false };
    }
    var last = sh.getLastRow() + 1;
    sh.getRange(last, map['學號']).setValue(sno);
    sh.getRange(last, map['姓名']).setValue(name);
    sh.getRange(last, map['班別']).setValue(cls);
    sh.getRange(last, map['分數']).setValue(score3 != null && !isNaN(score3) ? score3 : 0);
    return { ok: true, action: 'upsert', row: last, created: true };
  }

  throw new Error('longhu action 只接受 award／setScore／upsert');
}

function handleProgress_(action, body) {
  var sh = openSheetByGid_(prop_('PROGRESS_SHEET_ID'), prop_('PROGRESS_GID'));

  if (action === 'setcell' || action === 'set_cell') {
    var parsed = parseClassHeader_(body.class || body.className);
    var cls = parsed ? parsed.class : normClass_(body.class || body.className);
    if (!ALLOWED_CLASSES_PROGRESS[cls]) throw new Error('班別無效');
    var want = normTrack_(body.track || body.sub || '');
    if (!want && parsed && parsed.track) want = parsed.track;
    if (!want) {
      if (body.track) throw new Error('track 只接受 電腦／工場／數學');
      want = legacyProgressTrack_(cls);
    }
    var layout = progressLayout_(sh);
    var col = 0;
    var i;
    for (i = 0; i < layout.cols.length; i++) {
      if (layout.cols[i].class === cls && layout.cols[i].track === want) {
        col = layout.cols[i].col;
        break;
      }
    }
    if (!col) throw new Error('Sheet 未有欄「' + cls + ' ' + want + '」');
    var week = Number(body.week);
    if (!(week >= 1 && week <= 18)) throw new Error('week 必須 1–18');
    var text = body.text != null ? String(body.text) : (body.value != null ? String(body.value) : '');
    var row = findProgressWeekRow_(sh, week);
    if (!row) throw new Error('搵唔到第 ' + week + ' 週列');
    sh.getRange(row, col).setValue(text);
    return {
      ok: true,
      action: 'setCell',
      week: week,
      class: cls,
      track: want,
      row: row,
      col: col
    };
  }

  throw new Error('progress action 只接受 setCell');
}

/**
 * Two header rows: class (forward-filled across a merge) + 電腦/工場/數學.
 * Legacy single header maps 1B→工場, 2A→電腦, 1C→數學, other classes→電腦.
 */
function progressLayout_(sh) {
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var row1 = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  var row2 = [];
  if (sh.getLastRow() >= 2) {
    row2 = sh.getRange(2, 1, 1, lastCol).getValues()[0];
  }
  var twoRow = rowIsTrackHeader_(row2) || (!rowIsWeekLabel_(row2[0]) && headerLooksPaired_(row1));
  var cols = [];
  var lastCls = '';
  var seen = {};
  var c;
  for (c = 1; c < row1.length; c++) {
    var cell = String(row1[c] || '').trim();
    var parsed = parseClassHeader_(cell);
    if (parsed) lastCls = parsed.class;
    else if (cell) lastCls = '';
    if (!lastCls || !ALLOWED_CLASSES_PROGRESS[lastCls]) continue;
    var track = '';
    if (twoRow) {
      track = normTrack_(row2[c]);
      if (!track && parsed && parsed.track) track = parsed.track;
      if (!track && lastCls === '1C') track = '數學';
      if (!track) {
        var n = seen[lastCls] || 0;
        var pair = progressTracksFor_(lastCls);
        if (pair[n]) track = pair[n];
      }
    } else {
      track = (parsed && parsed.track) || legacyProgressTrack_(lastCls);
    }
    if (!track) continue;
    if (!trackAllowedFor_(lastCls, track)) continue;
    seen[lastCls] = (seen[lastCls] || 0) + 1;
    cols.push({ col: c + 1, class: lastCls, track: track });
  }
  return { twoRow: twoRow, cols: cols };
}

function progressTracksFor_(cls) {
  if (cls === '1C') return ['數學'];
  return ['電腦', '工場'];
}

function trackAllowedFor_(cls, track) {
  var list = progressTracksFor_(cls);
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === track) return true;
  }
  return false;
}

function legacyProgressTrack_(cls) {
  if (cls === '1B') return '工場';
  if (cls === '2A') return '電腦';
  if (cls === '1C') return '數學';
  return '電腦';
}

function normTrack_(v) {
  var s = String(v || '').replace(/\s+/g, '');
  if (!s) return '';
  var map = {
    '電腦': '電腦',
    '电脑': '電腦',
    'PC': '電腦',
    '工場': '工場',
    '工廠': '工場',
    '工厂': '工場',
    '數學': '數學',
    '数学': '數學',
    'MATH': '數學'
  };
  if (map[s]) return map[s];
  var up = s.toUpperCase();
  if (map[up]) return map[up];
  return '';
}

function parseClassHeader_(raw) {
  var compact = String(raw || '').replace(/\s+/g, '');
  if (!compact) return null;
  var m = compact.match(/^(1A|1B|1C|2A|2B|3B)/i);
  if (!m) return null;
  var cls = m[1].toUpperCase();
  if (!ALLOWED_CLASSES_PROGRESS[cls]) return null;
  return { class: cls, track: normTrack_(compact.slice(m[1].length)) };
}

function rowIsWeekLabel_(label) {
  var s = String(label || '').trim();
  if (/^w\s*\d+/i.test(s)) return true;
  if (/^\d+$/.test(s)) return true;
  if (/第\s*\d+\s*週/.test(s)) return true;
  return false;
}

function rowIsTrackHeader_(row) {
  if (!row || !row.length || rowIsWeekLabel_(row[0])) return false;
  var hits = 0;
  var i;
  for (i = 1; i < row.length; i++) {
    if (normTrack_(row[i])) hits++;
  }
  return hits >= 2;
}

function headerLooksPaired_(header) {
  var last = '';
  var pairs = 0;
  var i;
  for (i = 1; i < header.length; i++) {
    var cell = String(header[i] || '').trim();
    var parsed = parseClassHeader_(cell);
    if (!cell) {
      if (last) pairs++;
      continue;
    }
    if (parsed && parsed.class === last) pairs++;
    if (parsed) last = parsed.class;
    else last = '';
  }
  return pairs >= 2;
}

function findLonghuRow_(sh, map, body) {
  var sno = String(body.studentNo || body.studentId || '').trim();
  var name = String(body.name || '').trim();
  var cls = normClass_(body.class || body.className);
  var values = sh.getDataRange().getValues();
  var i;
  if (sno) {
    for (i = 1; i < values.length; i++) {
      if (String(values[i][map['學號'] - 1] || '').trim() === sno) return i + 1;
    }
  }
  if (name && cls) {
    for (i = 1; i < values.length; i++) {
      var n = String(values[i][map['姓名'] - 1] || '').trim();
      var c = normClass_(values[i][map['班別'] - 1]);
      if (n === name && c === cls) return i + 1;
    }
  }
  return 0;
}

function findProgressWeekRow_(sh, week) {
  var values = sh.getDataRange().getValues();
  var i;
  for (i = 1; i < values.length; i++) {
    var label = String(values[i][0] || '');
    var m = label.match(/(\d+)/);
    if (m && Number(m[1]) === week) return i + 1;
    if (Number(label) === week) return i + 1;
  }
  return 0;
}

function openSheetByGid_(spreadsheetId, gid) {
  if (!spreadsheetId) throw new Error('未設 Sheet ID（Script Properties）');
  var ss = SpreadsheetApp.openById(String(spreadsheetId));
  var sheets = ss.getSheets();
  var want = String(gid || '');
  var i;
  if (want) {
    for (i = 0; i < sheets.length; i++) {
      if (String(sheets[i].getSheetId()) === want) return sheets[i];
    }
    throw new Error('搵唔到 gid=' + want);
  }
  return ss.getSheets()[0];
}

function headerMap_(sh) {
  var headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
  var map = {};
  var i;
  for (i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').trim();
    if (!h) continue;
    map[h] = i + 1;
    map[h.toUpperCase()] = i + 1;
  }
  // aliases
  if (!map['學號'] && map['id']) map['學號'] = map['id'];
  if (!map['姓名'] && map['name']) map['姓名'] = map['name'];
  if (!map['班別'] && map['class']) map['班別'] = map['class'];
  if (!map['分數'] && map['score']) map['分數'] = map['score'];
  return map;
}

function requireCols_(map, names) {
  var i;
  for (i = 0; i < names.length; i++) {
    if (!map[names[i]]) throw new Error('Sheet 缺欄「' + names[i] + '」');
  }
}

function normClass_(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '');
}

function prop_(key) {
  return String(PropertiesService.getScriptProperties().getProperty(key) || '').trim();
}

function assertToken_(body, e) {
  var expected = prop_('WRITE_TOKEN');
  if (!expected || expected === 'REPLACE_ME') {
    throw new Error('伺服端未設定 WRITE_TOKEN（Script Properties）');
  }
  var got = '';
  if (body && body.token) got = String(body.token);
  if (!got && e && e.parameter && e.parameter.token) got = String(e.parameter.token);
  // Apps Script 未必轉發自訂 header；仍嘗試
  if (!got && e && e.postData && e.postData.type) {
    // no-op
  }
  if (got !== expected) throw new Error('token 無效');
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  var raw = String(e.postData.contents || '').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function jsonOut_(obj, _statusIgnored) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
