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
