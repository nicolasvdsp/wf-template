/**
 * Simplified Webflow Loader
 * 
 * Minimal loader that tries localhost first, falls back to Netlify.
 * 
 * Paste this in Webflow's Custom Code section (Before </body> tag)
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const PRODUCTION = false; // Set to true for production (uses minified), false for development (uses unminified)
  const NETLIFY_URL = 'https://MY-PROJECT.netlify.app'; // Update with your Netlify URL
  const LOCAL_PORT = 3000; // Port your Vite dev server runs on
  const LOCAL_URL = `http://localhost:${LOCAL_PORT}/src/main.js`; // Vite dev server source

  // ============================================
  // LOCALHOST DETECTION & LOADING
  // ============================================
  function testLocalhost() {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 200);

      fetch(LOCAL_URL, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Avoid CORS issues for detection
      })
        .then(() => {
          clearTimeout(timeoutId);
          resolve(true);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve(false);
        });
    });
  }

  function loadScript(url, isModule = false) {
    const script = document.createElement('script');
    script.src = url;
    if (isModule) {
      script.type = 'module';
    }
    document.body.appendChild(script);
  }

  // Try localhost, fallback to Netlify (minified if PRODUCTION=true, unminified if PRODUCTION=false)
  const prodScript = `${NETLIFY_URL}/${PRODUCTION ? 'main.min.js' : 'main.js'}`;

  testLocalhost()
    .then((localhostAvailable) => {
      if (localhostAvailable) {
        console.log('[Loader] Development mode: Loading from localhost');
        loadScript(LOCAL_URL, true); // type="module" for Vite dev
      } else {
        console.log('[Loader] Localhost unavailable, using Netlify');
        loadScript(prodScript, false); // Built bundle, no module type needed
      }
    })
    .catch((error) => {
      console.error('[Loader] Error:', error);
      // Fallback to Netlify on any error
      loadScript(prodScript, false);
    });
})();
