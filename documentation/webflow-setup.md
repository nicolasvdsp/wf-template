# Webflow Setup Instructions

## 1. Load CDN Dependencies (Before Custom Code)

In Webflow's Custom Code section (Before `</body>` tag), add your CDN dependencies first:

```html
<!-- GSAP Core -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollSmoother.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/SplitText.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"></script>

<!-- Three.js (if needed) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- jQuery (if needed) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

## 2. Load Your Custom Code

Choose one of the following loaders:

### Option A: Full Loader (Recommended for templates)

Copy the entire contents of `loader.js` and paste it in the Custom Code section (Before `</body>` tag), **after** the CDN scripts.

**Configuration in loader.js:**
- **`PRODUCTION`**: Set to `true` for production, `false` for development
- **`NETLIFY_URL`**: Your Netlify deployment URL (e.g., `https://my-project.netlify.app`)
- **`LOCAL_PORT`**: Port your Vite dev server runs on (default: 3000)
- **`FORCE_REFRESH_VERSION`**: Change this to bust cache when needed

**Pros:** Full control, production toggle, cache busting, better error handling

### Option B: Simplified Loader

Copy the entire contents of `loader-simplified.js` and paste it in the Custom Code section.

**Configuration in loader-simplified.js:**
- **`NETLIFY_URL`**: Your Netlify deployment URL
- **`LOCAL_PORT`**: Port your Vite dev server runs on (default: 3000)

**Pros:** Simpler code, always tries localhost first, automatic fallback to Netlify

### Option C: Simple Script Tag (No loader)

If you don't need localhost testing from Webflow, just use:

```html
<script async type="module" src="https://my-project.netlify.app/main.js"></script>
```

**Pros:** Maximum simplicity, one line, no detection logic

## 3. Development Workflow

### With Full Loader (`loader.js`):

1. **Local Development:**
   - Set `PRODUCTION = false` in `loader.js`
   - Run `npm run dev` in your terminal
   - The loader will automatically detect localhost and use it
   - If localhost is unavailable, it falls back to Netlify

2. **Production:**
   - Set `PRODUCTION = true` in `loader.js`
   - Build your project: `npm run build`
   - Push to GitHub (Netlify will auto-deploy)
   - The loader will only use Netlify URLs

### With Simplified Loader (`loader-simplified.js`):

1. **Local Development:**
   - Run `npm run dev` in your terminal
   - The loader automatically tries localhost first
   - Falls back to Netlify if localhost isn't available
   - No configuration needed!

2. **Production:**
   - Build your project: `npm run build`
   - Push to GitHub (Netlify will auto-deploy)
   - Loader will use Netlify (since localhost won't be available)

## 4. HTTPS for Webflow Staging Testing

If you want to test your local dev server from Webflow staging:

1. Generate a localhost certificate (if you don't have one):
   ```bash
   # Using mkcert (recommended)
   mkcert localhost 127.0.0.1
   ```

2. Place the certificate files in `./certs/`:
   - `localhost-key.pem` (private key)
   - `localhost.pem` (certificate)

3. The Vite config will automatically detect and use HTTPS if these files exist.

4. Update `loader.js` to use HTTPS for localhost:
   - Change `LOCAL_URL` to use `https://localhost:3000` if needed
   - Note: You'll need to accept the self-signed certificate in your browser

## 5. Feature Configuration

Edit `src/config.js` to enable/disable features:

```javascript
export const FEATURES = {
  animations: true,    // Enable animations
  breakpoints: true,  // Enable breakpoint handlers
  // glossary: false, // Disable glossary feature
}
```

Only enabled features will be loaded and initialized, keeping your bundle size small.
