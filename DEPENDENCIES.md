# Dependencies

This document provides transparency about all dependencies used in this project, including their licenses, purposes, and security considerations.

## Philosophy

We believe in:
- **Minimal dependencies**: Fewer dependencies = smaller attack surface
- **Open source**: All dependencies are open source and auditable
- **Regular updates**: Keep dependencies current for security
- **License compatibility**: All licenses compatible with GNU GPLv3
- **No tracking**: No analytics, telemetry, or tracking libraries

## Production Dependencies

These libraries are included in the production build and served to users.

### Core Framework

#### next (v15.5.3)
- **License**: MIT
- **Purpose**: React framework for production-ready applications
- **Why needed**: Core framework for static site generation
- **Repository**: https://github.com/vercel/next.js
- **Security**: Actively maintained by Vercel, regular security updates

#### react (v19.1.1)
- **License**: MIT
- **Purpose**: JavaScript library for building user interfaces
- **Why needed**: Core UI library
- **Repository**: https://github.com/facebook/react
- **Security**: Maintained by Meta, extensive security track record

#### react-dom (v19.1.1)
- **License**: MIT
- **Purpose**: React package for working with the DOM
- **Why needed**: Required for React web applications
- **Repository**: https://github.com/facebook/react
- **Security**: Part of React ecosystem, same security standards

## Development Dependencies

These libraries are only used during development and building. They are not included in the production bundle.

### Type Safety

#### typescript (v5.9.2)
- **License**: Apache-2.0
- **Purpose**: TypeScript language and compiler
- **Why needed**: Type safety and better developer experience
- **Repository**: https://github.com/microsoft/TypeScript
- **Security**: Maintained by Microsoft, mature and stable

#### @types/node (v24.5.2)
- **License**: MIT
- **Purpose**: TypeScript definitions for Node.js
- **Why needed**: Type safety for Node.js APIs
- **Repository**: https://github.com/DefinitelyTyped/DefinitelyTyped

#### @types/react (v19.1.13)
- **License**: MIT
- **Purpose**: TypeScript definitions for React
- **Why needed**: Type safety for React components
- **Repository**: https://github.com/DefinitelyTyped/DefinitelyTyped

#### @types/react-dom (v19.1.9)
- **License**: MIT
- **Purpose**: TypeScript definitions for ReactDOM
- **Why needed**: Type safety for React DOM operations
- **Repository**: https://github.com/DefinitelyTyped/DefinitelyTyped

### Code Quality

#### eslint (v9.35.0)
- **License**: MIT
- **Purpose**: JavaScript and TypeScript linter
- **Why needed**: Code quality and consistency
- **Repository**: https://github.com/eslint/eslint
- **Security**: Industry-standard linting tool

#### eslint-config-next (v15.5.3)
- **License**: MIT
- **Purpose**: ESLint configuration for Next.js projects
- **Why needed**: Next.js-specific linting rules
- **Repository**: https://github.com/vercel/next.js/tree/canary/packages/eslint-config-next

#### @eslint/eslintrc (v3.3.1)
- **License**: MIT
- **Purpose**: ESLint configuration utilities
- **Why needed**: ESLint configuration support
- **Repository**: https://github.com/eslint/eslintrc

## Indirect Dependencies

Our direct dependencies have their own dependencies (transitive dependencies). We monitor these through:

- **npm audit**: Regular security audits
- **Dependabot**: Automated security updates
- **Manual review**: Periodic dependency tree analysis

### Security Monitoring

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# View full dependency tree
npm list --all
```

## License Compatibility

All dependencies are compatible with our GNU GPLv3 license:

| Dependency | License | GPL Compatible |
|------------|---------|----------------|
| next | MIT | ✅ Yes |
| react | MIT | ✅ Yes |
| react-dom | MIT | ✅ Yes |
| typescript | Apache-2.0 | ✅ Yes |
| eslint | MIT | ✅ Yes |
| All @types/* | MIT | ✅ Yes |

## Dependency Selection Criteria

Before adding a dependency, we evaluate:

1. **Necessity**: Is this truly needed or can we implement it ourselves?
2. **Maintenance**: Is it actively maintained with regular updates?
3. **Security**: Does it have a good security track record?
4. **License**: Is it open source and GPL-compatible?
5. **Size**: What's the bundle size impact?
6. **Privacy**: Does it include tracking or telemetry?
7. **Alternatives**: Are there better alternatives?

## Security Practices

### Regular Updates

We update dependencies regularly:
- **Security patches**: Immediately upon notification
- **Minor updates**: Weekly review
- **Major updates**: Evaluated and tested before adoption

### Automated Security Scanning

- **Dependabot**: Enabled for automatic security updates
- **npm audit**: Run before every release
- **GitHub Security Advisories**: Monitored for our dependencies

### Pinned Versions

We use caret (^) versioning in package.json to allow patch updates while maintaining stability:
- **Major version**: Locked (requires manual update)
- **Minor version**: Locked (requires manual update)
- **Patch version**: Automatic (via npm update)

## Supply Chain Security

### Verification

```bash
# Verify package integrity
npm install --ignore-scripts

# Audit after install
npm audit

# Check for known issues
npm audit fix
```

### Lock File

`package-lock.json` ensures:
- Deterministic installs
- Exact version control
- Integrity checksums for all packages

**Important**: Never modify `package-lock.json` manually.

## Notable Absences

We **intentionally** do not include:

- **Analytics libraries** (Google Analytics, Mixpanel, etc.) - Privacy violation
- **Tracking pixels** (Facebook Pixel, etc.) - Privacy violation
- **CDN dependencies** - Supply chain risk, privacy concerns
- **Proprietary software** - Against open source principles
- **Telemetry** - No phone-home functionality
- **Ad networks** - Privacy violation
- **Social media widgets** - Privacy violation, tracking

## Adding New Dependencies

Before adding a new dependency, create a GitHub Issue discussing:
1. What problem it solves
2. Why existing dependencies can't solve it
3. Evaluation against our selection criteria
4. Impact on bundle size
5. Security considerations
6. License compatibility

## Removing Dependencies

We regularly evaluate whether dependencies are still needed:
- **Annual review**: Full dependency audit
- **Before major releases**: Review dependency necessity
- **On security issues**: Consider alternatives

## Dependency Statistics

**Current Stats** (as of last update):
- **Total dependencies**: 11 direct (3 production, 8 development)
- **Total packages installed**: ~351 (including transitive)
- **Known vulnerabilities**: 0
- **Outdated packages**: Check with `npm outdated`

## Updating This Document

This document should be updated:
- When adding new dependencies
- When removing dependencies
- During major version updates
- After security incidents
- At least quarterly for review

## Verification

Verify the current dependencies match this document:

```bash
# List production dependencies
npm list --prod --depth=0

# List development dependencies
npm list --dev --depth=0

# Check for vulnerabilities
npm audit
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Dependabot](https://github.com/dependabot)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [SPDX License List](https://spdx.org/licenses/)

## Questions?

For questions about dependencies:
- **GitHub Discussions**: General questions
- **GitHub Issues**: Propose new dependencies or report issues
- **Email**: system@alternatefutures.ai

---

**Last Updated**: 2025-01-12
**Next Review**: 2025-04-12 (quarterly review)
