# Alternate Futures - Company Website

Next.js-based company website featuring homepage, consulting services, and products pages.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```
   This generates static files in the `out` directory.

## Deployment

### Fleek Configuration

**Build Settings:**
- **Framework:** Next.js
- **Base Directory:** `./`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `out`
- **Docker Image:** `node:20-alpine`

**Environment Variables:**
Add the following environment variable in Fleek:
- **Key:** `NODE_VERSION`
- **Value:** `20`

**Important:** The Docker Image setting is required for Next.js 15.5.3 to build successfully. Fleek's default image uses Node.js 18.17.1, which is incompatible with this version of Next.js.

### Requirements
- Node.js version 20 or higher (specified in `.nvmrc`)
- Next.js 15.5.3

## Project Structure

```
├── public/           # Static assets (images, fonts, icons)
├── src/
│   ├── app/         # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── consulting/        # Consulting page
│   │   └── products/          # Products page
│   └── components/  # React components
├── styles.css       # Global styles
└── out/            # Build output (generated)
```

## Pages

- **Homepage (/)** - Company overview with wave divider
- **Consulting (/consulting)** - Services and offerings
- **Products (/products)** - Coming soon page for printshot.xyz

## Tech Stack

- Next.js 15.5.3
- React 19
- TypeScript
- Static Export (SSG)

## Performance Optimizations

This site is optimized for fast loading:

- **WOFF2 Fonts:** All fonts are served in WOFF2 format with TTF fallback (~60% smaller than TTF-only)
- **Font Preloading:** Critical fonts are preloaded to prevent layout shifts
- **Font Display Swap:** Uses `font-display: swap` to prevent invisible text during font loading
- **DNS Prefetching:** External domains (LinkedIn, Twitter) are prefetched
- **Compression:** Gzip compression enabled in Next.js config
- **Optimized Assets:** SVG icons and images optimized for web delivery

### Font Files

Located in `public/fonts/`:
- InstrumentSans (Regular, Medium, SemiBold) - Primary sans-serif font
- InstrumentSerif (Regular, Italic) - Used for hero text on consulting page

Both WOFF2 and TTF formats are included for maximum browser compatibility.

## Development Notes

### Email Links
All contact buttons link to: `mailto:system@alternatefutures.ai`

### Fonts
To regenerate WOFF2 fonts from TTF (if fonts are updated):
```bash
npm install --save-dev ttf2woff2
node convert-fonts.mjs  # (create this script if needed)
```

### Routing
Clean URLs are enabled via `public/_redirects` file:
- `/consulting` → `consulting.html`
- `/products` → `products.html`

This is required for proper routing on IPFS/Fleek deployments.
