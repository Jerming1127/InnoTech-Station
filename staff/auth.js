/**
 * InnoTech Station — staff gate (client-side only).
 * Password hash in localStorage; session unlock in sessionStorage.
 * Not bank-grade — private link + password + local data only.
 */
(function (global) {
  "use strict";

  var PW_HASH_KEY = "innotech-staff-pw-hash";
  var SESSION_KEY = "innotech-staff-unlocked";

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = "";
    for (var i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16);
      out += h.length === 1 ? "0" + h : h;
    }
    return out;
  }

  function sha256(text) {
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(text)).then(toHex);
  }

  function hasPassword() {
    return !!localStorage.getItem(PW_HASH_KEY);
  }

  function isUnlocked() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function unlockSession() {
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  function lockSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function setPassword(plain) {
    if (!plain || String(plain).length < 4) {
      return Promise.reject(new Error("密碼至少 4 個字元"));
    }
    return sha256(String(plain)).then(function (hash) {
      localStorage.setItem(PW_HASH_KEY, hash);
      unlockSession();
    });
  }

  function verifyPassword(plain) {
    var stored = localStorage.getItem(PW_HASH_KEY);
    if (!stored) return Promise.resolve(false);
    return sha256(String(plain || "")).then(function (hash) {
      if (hash === stored) {
        unlockSession();
        return true;
      }
      return false;
    });
  }

  function changePassword(oldPlain, newPlain) {
    return verifyPassword(oldPlain).then(function (ok) {
      if (!ok) throw new Error("舊密碼不正確");
      return setPassword(newPlain);
    });
  }

  function logout() {
    lockSession();
  }

  /**
   * Gate current page. If locked, show #staff-gate and hide #staff-app.
   * Call after DOM ready. Returns true if unlocked.
   */
  function requireAuth(opts) {
    opts = opts || {};
    var gate = document.getElementById("staff-gate");
    var app = document.getElementById("staff-app");
    if (!gate || !app) return isUnlocked();

    function showGate() {
      gate.hidden = false;
      app.hidden = true;
      renderGateForm();
    }

    function showApp() {
      gate.hidden = true;
      app.hidden = false;
      if (typeof opts.onUnlock === "function") opts.onUnlock();
    }

    function renderGateForm() {
      var setup = !hasPassword();
      var title = setup ? "設定職員密碼" : "職員登入";
      var hint = setup
        ? "首次使用請設定密碼（至少 4 字）。密碼雜湊只存於本機瀏覽器。"
        : "輸入職員密碼以解鎖本節工作階段。";
      gate.innerHTML =
        '<div class="gate-card">' +
        "<h1>" +
        title +
        "</h1>" +
        '<p class="muted">' +
        hint +
        "</p>" +
        '<label class="field"><span>密碼</span><input type="password" id="gate-pw" autocomplete="' +
        (setup ? "new-password" : "current-password") +
        '" /></label>' +
        (setup
          ? '<label class="field"><span>確認密碼</span><input type="password" id="gate-pw2" autocomplete="new-password" /></label>'
          : "") +
        '<p class="err" id="gate-err" hidden></p>' +
        '<button type="button" class="btn btn-primary" id="gate-submit">' +
        (setup ? "設定並進入" : "解鎖") +
        "</button>" +
        '<p class="footnote">靜態 GitHub Pages 嘅前端密碼唔係銀行級保安；靠私人連結＋密碼＋資料留喺本機瀏覽器。</p>' +
        "</div>";

      var submit = document.getElementById("gate-submit");
      var errEl = document.getElementById("gate-err");
      function fail(msg) {
        errEl.hidden = false;
        errEl.textContent = msg;
      }
      function go() {
        errEl.hidden = true;
        var pw = document.getElementById("gate-pw").value;
        if (setup) {
          var pw2 = document.getElementById("gate-pw2").value;
          if (pw !== pw2) return fail("兩次密碼唔一致");
          setPassword(pw)
            .then(showApp)
            .catch(function (e) {
              fail(e.message || "設定失敗");
            });
        } else {
          verifyPassword(pw).then(function (ok) {
            if (ok) showApp();
            else fail("密碼錯誤");
          });
        }
      }
      submit.addEventListener("click", go);
      gate.addEventListener("keydown", function (e) {
        if (e.key === "Enter") go();
      });
    }

    if (isUnlocked() && hasPassword()) {
      showApp();
      return true;
    }
    showGate();
    return false;
  }

  global.StaffAuth = {
    hasPassword: hasPassword,
    isUnlocked: isUnlocked,
    setPassword: setPassword,
    verifyPassword: verifyPassword,
    changePassword: changePassword,
    logout: logout,
    requireAuth: requireAuth,
    PW_HASH_KEY: PW_HASH_KEY,
  };
})(window);
