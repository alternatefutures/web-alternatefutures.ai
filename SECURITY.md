# Security Policy

## Our Commitment

Security and privacy are core principles of Alternate Futures. We take security vulnerabilities seriously and appreciate the security research community's efforts in helping us maintain a secure platform.

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |
| Older releases | :x: |

We recommend always using the latest version deployed to production.

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

### Responsible Disclosure Process

1. **Email**: Send details to **system@alternatefutures.ai**
   - Use subject line: `[SECURITY] Brief description`
   - Include detailed description of the vulnerability
   - Provide steps to reproduce
   - Include potential impact assessment
   - Attach proof of concept if available

2. **Encrypted Communication** (Optional but encouraged):
   - For sensitive disclosures, request our PGP key
   - We'll provide encryption details upon request

3. **What to Include**:
   - Type of vulnerability (XSS, CSRF, injection, etc.)
   - Affected components or pages
   - Steps to reproduce with screenshots/videos
   - Potential impact (confidentiality, integrity, availability)
   - Suggested remediation (if known)
   - Your name/handle for acknowledgment (optional)

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Assessment**: Within 7 days we'll assess severity and validity
- **Updates**: We'll provide regular updates every 7 days
- **Resolution**: Critical issues resolved within 30 days, others within 90 days
- **Disclosure**: Coordinated disclosure after fix is deployed

### Severity Classification

We follow CVSS 3.1 scoring:

- **Critical (9.0-10.0)**: Immediate attention, patch within 7 days
- **High (7.0-8.9)**: High priority, patch within 30 days
- **Medium (4.0-6.9)**: Standard priority, patch within 90 days
- **Low (0.1-3.9)**: Future release consideration

## Scope

### In Scope

Security issues in:
- **This repository**: web-alternatefutures.ai
- **Deployment infrastructure**: IPFS/Fleek configuration
- **Dependencies**: Third-party library vulnerabilities
- **Build process**: Supply chain security issues
- **Privacy leaks**: Unintended data exposure

Examples of valid reports:
- Cross-Site Scripting (XSS)
- Content Security Policy bypasses
- Privacy violations (tracking, fingerprinting)
- Dependency vulnerabilities (if exploitable)
- Security header misconfigurations
- Information disclosure
- Supply chain attacks

### Out of Scope

The following are **not** considered security vulnerabilities:

- **Social engineering**: Attacks requiring user interaction beyond normal use
- **Denial of Service**: Volume-based attacks on public website
- **Missing best practices**: Without demonstrated exploitability
- **Physical attacks**: Requiring physical access to infrastructure
- **Third-party services**: Issues with LinkedIn, Twitter, DNS providers
- **Browser-specific bugs**: Issues in browsers themselves
- **Theoretical vulnerabilities**: Without proof of concept

## Security Best Practices

### For Contributors

When contributing code:
- **Never commit secrets** (API keys, tokens, passwords)
- **Validate all inputs** and sanitize outputs
- **Follow Content Security Policy** directives
- **Use secure dependencies** (`npm audit` clean)
- **Implement security headers** as documented
- **Avoid inline scripts** unless absolutely necessary
- **Use HTTPS only** for external resources
- **Document security decisions** in code comments

### For Users

When self-hosting:
- **Keep dependencies updated** (`npm update`)
- **Use HTTPS** with valid certificates
- **Configure security headers** properly
- **Regular security audits** (`npm audit`)
- **Monitor for updates** to this repository
- **Use strong secrets** for environment variables

## Security Features

Current security implementations:

### Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filter (legacy browsers)
- `X-DNS-Prefetch-Control: off` - Privacy protection
- `Referrer-Policy: no-referrer` - No referrer leakage
- `Content-Security-Policy` - Strict CSP policy
- `Permissions-Policy` - Feature access restrictions

### Privacy
- **No analytics** or tracking code
- **No cookies** or local storage
- **No server-side logging** of user data
- **No third-party requests** (except social links on click)
- **Static site generation** - No server-side processing

### Infrastructure
- **IPFS deployment** - Censorship resistant
- **Static export** - Reduced attack surface
- **Dependency scanning** - Automated via Dependabot
- **Minimal dependencies** - Reduced supply chain risk

## Acknowledgments

We believe in recognizing security researchers who help improve our security:

### Hall of Fame
- Contributors will be listed here with permission
- Recognition in CHANGELOG.md for security fixes
- Optional credit in git commit messages

### Bug Bounty

We currently do not offer a paid bug bounty program, but we deeply appreciate responsible disclosure and will:
- Publicly acknowledge your contribution (with permission)
- Prioritize fixing reported vulnerabilities
- Provide detailed feedback on your report

## Security Updates

Security updates are announced through:
- **GitHub Security Advisories**
- **CHANGELOG.md** (security section)
- **Git commit messages** (tag: `security:`)
- **GitHub Releases** (with security notes)

Subscribe to repository releases to stay informed.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Secure Headers](https://securityheaders.com/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## Questions?

For security questions that are not vulnerability reports:
- Open a GitHub Discussion
- Email system@alternatefutures.ai

Thank you for helping keep Alternate Futures secure!
