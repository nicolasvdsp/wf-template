/**
 * Webflow Custom Code Loader
 * 
 * Paste this entire script in Webflow's Custom Code section (Before </body> tag)
 * 
 * Configuration:
 * - Set PRODUCTION to true for production (Netlify only)
 * - Set PRODUCTION to false for development (tries localhost first, falls back to Netlify)
 * - Update NETLIFY_URL to your Netlify deployment URL
 * - Update LOCAL_PORT if your dev server uses a different port
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const PRODUCTION = false; // Set to true for production (uses minified), false for development (uses unminified)
  const NETLIFY_URL = 'https://MY-PROJECT.netlify.app'; // Update with your Netlify URL
  const LOCAL_PORT = 3000; // Port your Vite dev server runs on
  const FORCE_REFRESH_VERSION = '1.0.0'; // Change this to bust cache when needed

  // ============================================
  // URL CONSTRUCTION
  // ============================================
  const LOCAL_URL = `http://localhost:${LOCAL_PORT}`;
  const LOCAL_HTTPS_URL = `https://localhost:${LOCAL_PORT}`;

  // Dev mode: Vite HMR client + source file
  const LOCALHOST_SCRIPTS = [
    `${LOCAL_URL}/@vite/client`,
    `${LOCAL_URL}/src/main.js`,
  ];

  // Production: built bundle (minified if PRODUCTION=true, unminified if PRODUCTION=false)
  const PROD_SCRIPT = `${NETLIFY_URL}/${PRODUCTION ? 'main.min.js' : 'main.js'}?v=${FORCE_REFRESH_VERSION}`;

  // ============================================
  // SCRIPT LOADING FUNCTIONS
  // ============================================
  function createScript(url, isDevMode = false) {
    const script = document.createElement('script');
    script.src = url;

    if (isDevMode) {
      script.type = 'module';
    }

    return script;
  }

  function loadScript(script) {
    return new Promise((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${script.src}`));
      document.body.appendChild(script);
    });
  }

  function loadScriptsSequentially(scripts) {
    return scripts.reduce((promise, script, index) => {
      return promise.then(() => {
        return loadScript(script);
      });
    }, Promise.resolve());
  }

  // ============================================
  // LOCALHOST DETECTION
  // ============================================
  function testLocalhost() {
    return new Promise((resolve) => {
      const testUrl = LOCALHOST_SCRIPTS[0];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 200);

      fetch(testUrl, {
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

  // ============================================
  // MAIN LOADING LOGIC
  // ============================================
  async function init() {
    let scriptsToLoad = null;
    let isDevMode = false;

    if (PRODUCTION) {
      // Production: use Netlify only
      scriptsToLoad = [createScript(PROD_SCRIPT, false)];
    } else {
      // Development: try localhost first
      const localhostAvailable = await testLocalhost();

      if (localhostAvailable) {
        scriptsToLoad = LOCALHOST_SCRIPTS.map(url => createScript(url, true));
        isDevMode = true;
        console.log('[Loader] Development mode: Loading from localhost');
      } else {
        scriptsToLoad = [createScript(PROD_SCRIPT, false)];
        console.log('[Loader] Localhost unavailable, falling back to Netlify');
      }
    }

    try {
      await loadScriptsSequentially(scriptsToLoad);
      console.log('[Loader] Scripts loaded successfully');
    } catch (error) {
      console.error('[Loader] Error loading scripts:', error);

      // If dev mode failed, try production fallback
      if (isDevMode && !PRODUCTION) {
        console.log('[Loader] Retrying with production build...');
        const fallbackScript = createScript(PROD_SCRIPT, false);
        try {
          await loadScript(fallbackScript);
          console.log('[Loader] Fallback successful');
        } catch (fallbackError) {
          console.error('[Loader] Fallback also failed:', fallbackError);
        }
      }
    }
  }

  // Start loading
  init();
})();
