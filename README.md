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
   pnpm build
   ```
   This generates the Next.js standalone application used by the production container.

## Deployment

### Alternate Clouds production deployment

Production is a Next.js standalone container deployed as an Alternate Clouds service. A push to
`main` builds and publishes `ghcr.io/alternatefutures/web-alternatefutures.ai:latest`, then redeploys
the configured service with the official `@alternatefutures/acc` CLI.

The GitHub production environment requires:

- Secret `AF_TOKEN`: an Alternate Clouds personal access token
- Variable `AF_ORG_ID`: `MJ2XOZuDV31PX55QFth9D` (the preferred **Alternate Futures** organization)
- Variable `AF_PROJECT_ID`: the project that owns the website service
- Variable `AF_SERVICE_ID`: the production website service
- An Alternate Clouds service configured to expose port 3000

All Alternate Futures production deployments must target the team organization above, not a
personal organization. The workflow publishes an immutable image for the commit, updates the
service's image reference through the Alternate Clouds GraphQL API, and then deploys that exact
release.

The workflow fails closed when any required value is missing. It does not report a successful
deployment unless the official `acc services deploy` command succeeds.

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
└── .next/          # Standalone build output (generated)
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
- Next.js standalone server output

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

Legacy static-host redirects remain for mirrors; production runs as a container on Alternate Clouds.

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
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflow and branching strategy

### Privacy & Security
- **Privacy Policy**: Available at [/privacy](/privacy)
- **Security Headers**: Comprehensive CSP, frame protection, referrer policy
- **Consent-Based Analytics**: Google Analytics loads only after a visitor opts in; advertising signals are disabled
- **Censorship Resistant**: IPFS deployment with multiple access methods

## Security Features

This project implements defense-in-depth security:

- ✅ **Content Security Policy** - Strict CSP preventing XSS attacks
- ✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- ✅ **Referrer Policy** - No referrer leakage to external sites
- ✅ **DNS Prefetch Control** - Privacy-focused DNS handling
- ✅ **Limited External Resources** - Site assets are self-hosted; consented analytics is loaded from Google
- ✅ **Static Site** - No server-side processing or data collection
- ✅ **Regular Audits** - Automated security scanning via Dependabot
- ✅ **Open Source** - Fully auditable codebase

## Privacy Commitment

Public-site analytics is **optional**:
- Google Analytics loads only after an explicit opt-in
- Google Signals and advertising personalization are disabled
- Administrative and login routes are excluded from analytics
- Visitors can change their choice on the privacy page
- Contact and access-request information is used only for the stated business purpose

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
