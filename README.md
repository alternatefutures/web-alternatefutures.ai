![](.repo/images/repo/hero-logo.svg)

# ✨ Main Website ✨
# alternatefutures.ai

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
- **Products (/products)** - Product offerings including Web Services
- **Web Services (/products/web-services)** - Distributed infrastructure platform

## Related Repositories

This website showcases our products. For developer resources:

- **[CLI](https://github.com/alternatefutures/package-cloud-cli)** - Command-line interface for deploying to distributed infrastructure
- **[SDK](https://github.com/alternatefutures/package-cloud-sdk)** - Software development kit for programmatic access
- **[App](https://github.com/alternatefutures/web-app.alternatefutures.ai)** - Web application dashboard

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

### Font Tools
To regenerate or process fonts, use npx to run tools without installing them:
```bash
npx ttf2woff2 input.ttf output.woff2
npx glyphhanger --subset=*.ttf --formats=woff2
```

### Routing
Clean URLs are enabled via `public/_redirects` file:
- `/consulting` → `consulting.html`
- `/products` → `products.html`

This is required for proper routing on IPFS/AF Cloud deployments.

## Documentation

### Project Policies
- **[LICENSE](LICENSE)** - GNU GPLv3 license for strong copyleft protection
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines and standards
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to this project
- **[SECURITY.md](SECURITY.md)** - Security policy and vulnerability reporting
- **[GOVERNANCE.md](GOVERNANCE.md)** - Project governance and decision-making

### Technical Documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and notable changes
- **[DEPENDENCIES.md](DEPENDENCIES.md)** - Complete dependency transparency
- **[REPRODUCIBLE_BUILDS.md](REPRODUCIBLE_BUILDS.md)** - Build verification instructions
- **[MIRRORS.md](MIRRORS.md)** - Access methods and censorship resistance

### Privacy & Security
- **Privacy Policy**: Available at [/privacy](/privacy)
- **Security Headers**: Comprehensive CSP, frame protection, referrer policy
- **No Tracking**: Zero analytics, cookies, or user data collection
- **Censorship Resistant**: IPFS deployment with multiple access methods

## Security Features

This project implements defense-in-depth security:

- ✅ **Content Security Policy** - Strict CSP preventing XSS attacks
- ✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- ✅ **Referrer Policy** - No referrer leakage to external sites
- ✅ **DNS Prefetch Control** - Privacy-focused DNS handling
- ✅ **No External Resources** - All assets self-hosted
- ✅ **Static Site** - No server-side processing or data collection
- ✅ **Regular Audits** - Automated security scanning via Dependabot
- ✅ **Open Source** - Fully auditable codebase

## Privacy Commitment

We collect **nothing**:
- No analytics or tracking
- No cookies or local storage
- No user accounts or authentication
- No IP logging or fingerprinting
- No third-party requests (except social links on click)

See [Privacy Policy](/privacy) for full details.

## Censorship Resistance

Multiple access methods ensure availability:
- **HTTPS**: https://alternatefutures.ai
- **IPFS**: Via any public gateway (CID in releases)
- **Self-hosting**: Clone and deploy yourself
- **Community mirrors**: See [MIRRORS.md](MIRRORS.md)

## Community

- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Discussions**: [GitHub Discussions](https://github.com/alternatefutures/web-alternatefutures.ai/discussions)
- **Issues**: [GitHub Issues](https://github.com/alternatefutures/web-alternatefutures.ai/issues)
- **Email**: system@alternatefutures.ai

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE) - see the LICENSE file for details.

**TL;DR**: You can freely use, modify, and distribute this software, but any modifications must also be released under GNU GPLv3.
