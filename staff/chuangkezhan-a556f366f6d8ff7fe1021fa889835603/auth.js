/**
 * InnoTech Station — staff gate via Google Identity Services (GIS).
 * Client-side only on GitHub Pages. Session in sessionStorage.
 * Allowlist lives in auth-config.js (readable in source — see comments there).
 */
(function (global) {
  "use strict";

  var SESSION_KEY = "innotech-staff-google-session-v1";
  var GIS_SRC = "https://accounts.google.com/gsi/client";

  function cfg() {
    return global.StaffAuthConfig || {};
  }

  function allowedSet() {
    var list = cfg().ALLOWED_EMAILS || [];
    var set = {};
    for (var i = 0; i < list.length; i++) {
      var e = String(list[i] || "").trim().toLowerCase();
      if (e) set[e] = true;
    }
    return set;
  }

  function parseJwtPayload(credential) {
    try {
      var parts = String(credential || "").split(".");
      if (parts.length < 2) return null;
      var b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      var json = decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.email) return null;
      var email = String(s.email).toLowerCase();
      if (!allowedSet()[email]) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function writeSession(payload) {
    var email = String(payload.email || "").toLowerCase();
    var session = {
      email: email,
      name: payload.name || "",
      picture: payload.picture || "",
      sub: payload.sub || "",
      at: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isUnlocked() {
    return !!readSession();
  }

  function currentUser() {
    return readSession();
  }

  function logout() {
    clearSession();
    try {
      if (global.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    } catch (e) {}
  }

  function loadGisScript() {
    return new Promise(function (resolve, reject) {
      if (global.google && google.accounts && google.accounts.id) {
        resolve();
        return;
      }
      var existing = document.querySelector('script[data-staff-gis="1"]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(); });
        existing.addEventListener("error", function () {
          reject(new Error("無法載入 Google 登入元件"));
        });
        return;
      }
      var s = document.createElement("script");
      s.src = GIS_SRC;
      s.async = true;
      s.defer = true;
      s.setAttribute("data-staff-gis", "1");
      s.onload = function () { resolve(); };
      s.onerror = function () {
        reject(new Error("無法載入 Google 登入元件"));
      };
      document.head.appendChild(s);
    });
  }

  function clientIdReady() {
    var id = String(cfg().CLIENT_ID || "").trim();
    return id && id !== "REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID";
  }

  /**
   * Gate current page. Shows #staff-gate until Google allowlisted session exists.
   */
  function requireAuth(opts) {
    opts = opts || {};
    var gate = document.getElementById("staff-gate");
    var app = document.getElementById("staff-app");
    if (!gate || !app) return isUnlocked();

    function showGate() {
      gate.hidden = false;
      app.hidden = true;
      renderGate();
    }

    function showApp() {
      gate.hidden = true;
      app.hidden = false;
      paintUserChip();
      if (typeof opts.onUnlock === "function") opts.onUnlock();
    }

    function paintUserChip() {
      var chip = document.getElementById("staff-user-chip");
      if (!chip) return;
      var u = readSession();
      if (!u) {
        chip.hidden = true;
        return;
      }
      chip.hidden = false;
      chip.textContent = u.email;
      chip.title = u.name ? u.name + " · " + u.email : u.email;
    }

    function setErr(msg) {
      var errEl = document.getElementById("gate-err");
      if (!errEl) return;
      if (!msg) {
        errEl.hidden = true;
        errEl.textContent = "";
        return;
      }
      errEl.hidden = false;
      errEl.textContent = msg;
    }

    function onCredential(response) {
      setErr("");
      var payload = parseJwtPayload(response && response.credential);
      if (!payload || !payload.email) {
        setErr("登入失敗：未能讀取 Google 帳戶資料。");
        return;
      }
      var email = String(payload.email).toLowerCase();
      if (!allowedSet()[email]) {
        clearSession();
        setErr(
          "此 Google 帳戶（" +
            email +
            "）不在職員允許名單內。請用獲授權嘅帳戶登入，或聯絡站長加入名單。"
        );
        try {
          if (global.google && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
          }
        } catch (e) {}
        return;
      }
      writeSession(payload);
      showApp();
    }

    function renderGate() {
      var ready = clientIdReady();
      gate.innerHTML =
        '<div class="gate-card">' +
        "<h1>職員登入</h1>" +
        '<p class="muted">請用 Google 帳戶登入。未登入唔可以進入職員工具。</p>' +
        (ready
          ? ""
          : '<p class="err" id="gate-setup-warn">尚未設定 Google OAuth Client ID。請喺 auth-config.js 填入 Client ID 後再試。</p>') +
        '<div id="gsi-btn-wrap" class="gsi-btn-wrap"></div>' +
        '<p class="err" id="gate-err" hidden></p>' +
        "</div>";

      if (!ready) return;

      loadGisScript()
        .then(function () {
          google.accounts.id.initialize({
            client_id: cfg().CLIENT_ID,
            callback: onCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          var wrap = document.getElementById("gsi-btn-wrap");
          if (wrap) {
            google.accounts.id.renderButton(wrap, {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 280,
            });
          }
        })
        .catch(function (e) {
          setErr((e && e.message) || "無法載入 Google 登入");
        });
    }

    if (isUnlocked()) {
      showApp();
      return true;
    }
    showGate();
    return false;
  }

  global.StaffAuth = {
    isUnlocked: isUnlocked,
    currentUser: currentUser,
    logout: logout,
    requireAuth: requireAuth,
    SESSION_KEY: SESSION_KEY,
  };
})(window);
