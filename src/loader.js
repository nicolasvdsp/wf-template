/**
 * Staging / Localhost Detection
 *
 * On staging (.webflow.io): tries localhost dev server first.
 * If localhost is available, loads the dev version with HMR.
 * If not, falls back to the bundled code.
 *
 * On production (custom domain): runs the bundled code immediately.
 */

const DEV_PORT = 3011;
const DEV_MESSAGE = "🚧 Dev Mode activated";
const LIVE_MESSAGE = "🛸 Hi there explorer! You have stumbeled upon the mothership. Lookinging for secretes?";

export function detectAndRun(runApp) {
  // Prevent double execution (dev server loads main.js again)
  if (window.__LOADER_EXECUTED) {
    runApp();
    return;
  }
  window.__LOADER_EXECUTED = true;

  const isStaging = window.location.hostname.endsWith('.webflow.io');

  if (!isStaging) {
    // Production — run bundled code immediately
    runApp();
    return;
  }

  // Staging — try localhost dev server
  const localhostUrl = `http://localhost:${DEV_PORT}/src/main.js`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300);

  fetch(localhostUrl, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
    .then(() => {
      clearTimeout(timeoutId);
      console.log(DEV_MESSAGE);

      // Load Vite client for HMR
      const viteClient = document.createElement('script');
      viteClient.type = 'module';
      viteClient.src = `http://localhost:${DEV_PORT}/@vite/client`;
      document.head.appendChild(viteClient);

      // Load dev main.js (replaces this bundled version)
      const devScript = document.createElement('script');
      devScript.type = 'module';
      devScript.src = localhostUrl;
      document.body.appendChild(devScript);

      // Don't run the bundled code — dev server takes over
    })
    .catch(() => {
      clearTimeout(timeoutId);
      console.log(LIVE_MESSAGE);
      runApp();
    });
}
