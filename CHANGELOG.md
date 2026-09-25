# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Consent-based Google Analytics 4 measurement for public website routes
- Visitor controls for accepting, declining, or changing analytics consent
- Versioned, timestamped analytics consent receipts stored in the visitor's browser
- Comprehensive security headers (X-Frame-Options, CSP, Referrer-Policy, etc.)
- GNU GPLv3 license for strong copyleft protection
- CONTRIBUTING.md with detailed contribution guidelines
- CODE_OF_CONDUCT.md based on Contributor Covenant 2.1
- SECURITY.md with vulnerability reporting process
- GOVERNANCE.md outlining project decision-making
- Privacy-first meta tags and referrer policy
- Documentation for censorship resistance (MIRRORS.md)
- Reproducible builds documentation
- Dependencies transparency documentation

### Changed
- Expanded the privacy notice with controller identity, legal bases, recipients, international transfers, retention periods, GDPR rights, and complaint rights
- Limited consent and Google Analytics cookies to six months and renamed the rejection action to “Decline analytics”
- Replaced the obsolete no-op sites workflow with a fail-closed Alternate Clouds service deployment
- Applied the analytics Content Security Policy to Next.js responses as well as static mirrors
- Limited analytics page URLs to approved campaign and public-filter query parameters
- Prevented delayed analytics loads from overriding newer consent or excluded-route state
- Scoped the Alternate Clouds deployment token only to validation and deploy steps
- Updated the privacy policy and Content Security Policy for optional analytics
- Removed DNS prefetch for LinkedIn and Twitter (privacy improvement)
- Updated Next.js metadata with privacy-focused settings

### Security
- Delete Google Analytics cookies when a visitor withdraws or declines consent
- Keep all advertising consent signals denied even when analytics measurement is accepted
- Enhanced Content Security Policy
- Disabled DNS prefetching globally
- Added comprehensive security headers to all routes
- Removed potential privacy leaks in HTML headers

## [Previous Releases]

### [0.1.0] - 2025-01-11

#### Added
- Initial Next.js 15.5.3 website with React 19
- Static site generation (SSG) for IPFS compatibility
- Homepage with Hero and MainContent components
- Consulting services page
- Products page with Web Services subpage
- Status page
- Responsive design with mobile support
- Custom fonts (InstrumentSans, InstrumentSerif)
- WOFF2 font optimization for faster loading
- Basic caching headers for static assets
- Fleek deployment configuration
- Docker support for production builds

#### Performance
- Font preloading for critical fonts
- SVG optimization for assets
- Gzip compression enabled
- Optimized image handling for static export

#### Infrastructure
- IPFS/Fleek deployment setup
- Clean URL routing via _redirects
- Static export for decentralized hosting
- Node.js 20 requirement

---

## Release Categories

We use the following categories in our changelog:

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements or fixes
- **Performance**: Performance improvements
- **Infrastructure**: Deployment and infrastructure changes

## Versioning Strategy

- **Major version (X.0.0)**: Breaking changes, significant redesigns
- **Minor version (0.X.0)**: New features, non-breaking changes
- **Patch version (0.0.X)**: Bug fixes, security patches

## Links

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Repository](https://github.com/alternatefutures/web-alternatefutures.ai)

---

**Note**: This changelog tracks all significant changes to the project. For detailed commit history, see the [git log](https://github.com/alternatefutures/web-alternatefutures.ai/commits/).
