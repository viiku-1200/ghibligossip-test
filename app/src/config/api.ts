/**
 * ══════════════════════════════════════════════════
 * GhibliGossip — API Configuration
 * ══════════════════════════════════════════════════
 * Central place for backend URL and Google Client IDs.
 * When deploying to production, update BASE_URL to your server.
 */

// For Android emulator, 10.0.2.2 points to host machine's localhost
// For physical device on same WiFi, use your laptop's local IP (e.g. 192.168.x.x)
export const API_CONFIG = {
  // Change this to your laptop's local IP if testing on a physical phone
  BASE_URL: 'http://10.0.2.2:5000',

  // Google OAuth Client IDs
  GOOGLE_WEB_CLIENT_ID:
    '886494126670-gq5eh37mp9pes8q75tb6jadlhedqebk7.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID:
    '886494126670-c1l4fr0gc2n5qngapjhgto9ks4udtssl.apps.googleusercontent.com',
};
