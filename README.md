# Webflow Custom JavaScript Template

A modern, scalable template for adding custom JavaScript to Webflow projects using Vite, ES modules, and optional feature loading.

## Features

- ✅ **Vite-based bundling** - Modern build tool with HMR for development
- ✅ **CDN-first dependencies** - GSAP, Three.js, etc. loaded from CDN (shared cache benefits)
- ✅ **Optional module loading** - Enable/disable features via config (Finsweet-style)
- ✅ **Smart loader script** - Auto-detects localhost in dev, falls back to Netlify
- ✅ **HTTPS dev server support** - Test from Webflow staging with proper certs
- ✅ **SCSS support** - Write styles with modern Sass features
- ✅ **Production-ready** - Optimized builds with minification

## Quick Start

1. **Clone this template** (or use it as a starting point)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your project:**
   - Update `NETLIFY_URL` in `documentation/loader.js` with your Netlify deployment URL
   - Edit `src/config.js` to enable/disable features

4. **Set up Webflow:**
   - Follow instructions in `documentation/webflow-setup.md`
   - Choose a loader:
     - `documentation/loader.js` - Full-featured with PRODUCTION toggle
     - `documentation/loader-simplified.js` - Minimal, auto-detects localhost
     - Or use a simple `<script>` tag if you don't need localhost testing
   - Copy CDN scripts and your chosen loader to Webflow's Custom Code section

5. **Develop locally:**
   ```bash
   npm run dev
   ```
   - Set `PRODUCTION = false` in `documentation/loader.js` for local development
   - The loader will auto-detect localhost and use it

6. **Build for production:**
   ```bash
   npm run build
   ```
   - Set `PRODUCTION = true` in `documentation/loader.js` for production
   - Push to GitHub → Netlify auto-deploys

## Project Structure

```
├── src/
│   ├── config.js              # Feature configuration (enable/disable modules)
│   ├── main.js                # Entry point (loads features based on config)
│   ├── features/              # Feature modules
│   │   ├── animations/        # GSAP animations
│   │   └── breakpoints/       # Responsive breakpoint handlers
│   └── scss/                  # Styles
├── documentation/
│   ├── loader.js              # Full-featured loader (PRODUCTION toggle, cache busting)
│   ├── loader-simplified.js   # Simplified loader (auto localhost detection)
│   └── webflow-setup.md      # Detailed Webflow setup instructions
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Architecture

### Module System

Features are loaded conditionally based on `src/config.js`:

```javascript
export const FEATURES = {
  animations: true,    // Enabled
  breakpoints: true,   // Enabled
  // glossary: false,  // Disabled (won't load)
}
```

### CDN Dependencies

External libraries (GSAP, Three.js) are:
- **Loaded from CDN** in Webflow (shared cache benefits)
- **Externalized in build** (not bundled, smaller bundle size)
- **Accessed via `window`** in code (e.g., `window.gsap`)

### Development vs Production

- **Development** (`PRODUCTION = false`):
  - Loader tries localhost first (Vite dev server)
  - Falls back to Netlify if localhost unavailable
  - HMR enabled for instant updates

- **Production** (`PRODUCTION = true`):
  - Only uses Netlify URLs
  - Uses built, minified bundle
  - Cache-busting via version parameter

## Adding New Features

1. Create a new feature file in `src/features/`:
   ```javascript
   // src/features/my-feature.js
   function myFeature() {
     // Your code here
   }
   export default myFeature;
   ```

2. Add it to `src/config.js`:
   ```javascript
   export const FEATURES = {
     // ... existing features
     myFeature: true,
   }
   ```

3. Import conditionally in `src/main.js`:
   ```javascript
   if (FEATURES.myFeature) {
     import('./features/my-feature').then((module) => {
       module.default();
     });
   }
   ```

## HTTPS for Webflow Staging Testing

To test your local dev server from Webflow staging:

1. Generate a localhost certificate:
   ```bash
   mkcert localhost 127.0.0.1
   ```

2. Place files in `./certs/`:
   - `localhost-key.pem`
   - `localhost.pem`

3. Vite will automatically use HTTPS if certs are detected.

## Scripts

- `npm run dev` - Start dev server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run clean` - Clean dist folder
- `npm run lint:fix` - Fix linting issues

## Why This Approach?

This template combines the best of both worlds:

- **Vite bundling** for modern tooling, modules, and scalability
- **CDN dependencies** for shared cache benefits (GSAP, Three.js)
- **Optional modules** for flexible feature loading
- **Smart loader** for seamless dev/prod workflow

Compared to the dynamic script loader approach:
- ✅ Better for scaling (modules, dependencies handled)
- ✅ Smaller bundle (CDN libs not bundled)
- ✅ Modern tooling (TypeScript-ready, better refactors)
- ✅ Same simplicity (one loader script to paste)

## License

MIT
