// import './scss/app.scss';
import { INCLUDE_FEATURES } from './config';
import animations from './features/animations/animations';
import scrollBehaviour from './features/scroll-behaviour/scroll-behaviour';

import breakpoints from './features/breakpoints';
import glossary from './features/glossary';

// Get features from script tag attributes
// Usage: <script src="main.js" breakpoints></script>
function getFeaturesFromScriptTag() {
  // Find all script tags and locate the one that loaded this module
  const scripts = Array.from(document.querySelectorAll('script[type="module"], script[src*="main"]'));
  let currentScript = null;

  // Try to find the script that matches our module, we can use import.meta.url
  try {
    const moduleUrl = new URL(import.meta.url);
    currentScript = scripts.find(script => {
      if (!script.src) return false;
      try {
        const scriptUrl = new URL(script.src, window.location.href);
        const matchesMain = scriptUrl.pathname === moduleUrl.pathname ||
          script.src.includes('main.js') ||
          script.src.includes('main.min.js');
        return matchesMain;
      } catch {
        return script.src.includes('main.js') || script.src.includes('main.min.js');
      }
    });
  } catch {
    // Fallback: find any script with main.js or main.min.js
    currentScript = scripts.find(script =>
      script.src && (script.src.includes('main.js') || script.src.includes('main.min.js'))
    );
  }

  if (!currentScript) {
    return INCLUDE_FEATURES; // Fallback to config
  }


  const features = {};

  Object.keys(INCLUDE_FEATURES).forEach(key => {
    features[key] = currentScript.hasAttribute(key);
  });

  // If no attributes found, use config defaults
  const hasAnyAttribute = Object.values(features).some(v => v === true);
  if (!hasAnyAttribute) {
    return INCLUDE_FEATURES;
  }

  return features;
}

// Get active features (from script tag attributes or config)
const ACTIVE_FEATURES = getFeaturesFromScriptTag();

// Initialize features when DOM is ready
function initFeatures() {
  ACTIVE_FEATURES.animations && animations();
  ACTIVE_FEATURES.scrollBehaviour && scrollBehaviour();

  ACTIVE_FEATURES.breakpoints && breakpoints();
  ACTIVE_FEATURES.glossary && glossary();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeatures);
} else {
  initFeatures();
}