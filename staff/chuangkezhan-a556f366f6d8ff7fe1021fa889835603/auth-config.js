/**
 * InnoTech Station — staff Google Sign-In config (client-side only).
 *
 * HOW TO FINISH SETUP (before live push):
 * 1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID
 *    Application type: Web application
 * 2. Authorized JavaScript origins:
 *      https://jerming1127.github.io
 *    (optional local test: http://localhost:<port>)
 * 3. Authorized redirect URIs: not required for GIS One Tap / button credential flow
 *    (if you add a redirect-based flow later, use the Pages origin above).
 * 4. Paste the Client ID below, replacing REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID.
 * 5. Add allowed staff Gmail addresses to ALLOWED_EMAILS (lowercase).
 *
 * Honesty note: this allowlist ships in public static JS. Anyone who finds the
 * secret path can read emails and the Client ID. That is still stronger than a
 * shared frontend password (Google account + allowlist), but it is obfuscation
 * against casual visitors, not bank-grade access control. Owner accepted this
 * for GitHub Pages.
 */
(function (global) {
  "use strict";

  global.StaffAuthConfig = {
    /** Google OAuth 2.0 Web Client ID */
    CLIENT_ID: "759864941513-kpf94t1ved3o96fcspsi4t5qrslt6o89.apps.googleusercontent.com",

    /**
     * Emails allowed into staff tools (compared lowercased).
     * Add one string per line, e.g. "colleague@gmail.com",
     */
    ALLOWED_EMAILS: [
      "cheungwm@chusheklun.edu.hk",
      // add more later, e.g. "other@gmail.com",
    ],
  };
})(window);
