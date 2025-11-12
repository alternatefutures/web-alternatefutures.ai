# Contributing to Alternate Futures

Thank you for your interest in contributing to Alternate Futures! We welcome contributions from the community and are committed to making this project as open and accessible as possible.

## Our Values

This project is built on principles of:
- **Privacy First**: No tracking, no data collection, user autonomy
- **Censorship Resistance**: Decentralized deployment, multiple access methods
- **Open Source**: Transparent development, community-driven decisions
- **Security**: Regular audits, responsible disclosure, secure by default

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide detailed explanation** of the proposed feature
- **Explain why this enhancement would be useful** to most users
- **List any alternative solutions** you've considered

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities. See our [Security Policy](SECURITY.md) for responsible disclosure procedures.

## Development Process

### Getting Started

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Test thoroughly**: `npm run build` and verify locally
6. **Commit your changes** with clear commit messages
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Open a Pull Request**

### Development Environment

- **Node.js**: Version 20 or higher (specified in `.nvmrc`)
- **Package Manager**: npm
- **Framework**: Next.js 15.5.3 with React 19

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Follow the existing code style
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Comment complex logic, avoid obvious comments

### Commit Messages

Use clear, descriptive commit messages:

- **Format**: `type: description`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**:
  - `feat: add privacy policy page`
  - `fix: resolve mobile navigation issue`
  - `docs: update README with deployment instructions`

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** if applicable (we're building test infrastructure)
3. **Ensure build passes**: Run `npm run build` successfully
4. **Keep PRs focused**: One feature/fix per PR
5. **Link related issues**: Reference issues in PR description
6. **Wait for review**: Maintainers will review within 7 days
7. **Address feedback**: Make requested changes promptly

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code performed
- [ ] Comments added to complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
- [ ] Build completes successfully
- [ ] Changes are privacy-respecting and security-conscious

## Privacy & Security Guidelines

When contributing, ensure your code:

- **Never collects user data** without explicit consent
- **Never includes tracking** or analytics code
- **Never leaks information** to third parties
- **Follows security best practices** (CSP, headers, etc.)
- **Uses secure dependencies** (check `npm audit`)
- **Validates all inputs** and sanitizes outputs

## Testing

Currently, this project uses manual testing. We're building automated test infrastructure. For now:

1. **Test locally**: Run dev server and verify changes
2. **Test production build**: Run `npm run build` and verify static output
3. **Test on multiple browsers**: Chrome, Firefox, Safari minimum
4. **Test responsive design**: Mobile, tablet, desktop viewports
5. **Test accessibility**: Keyboard navigation, screen readers

## Documentation

Good documentation helps everyone:

- **Code comments**: Explain "why", not "what"
- **README updates**: Keep documentation current
- **Inline documentation**: JSDoc comments for functions
- **Changelog**: Update CHANGELOG.md for notable changes

## Community

- **Be respectful** and constructive in discussions
- **Help others** when you can
- **Share knowledge** and learn together
- **Celebrate contributions** from all community members

## Questions?

- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: system@alternatefutures.ai for private inquiries

## License

By contributing, you agree that your contributions will be licensed under the [GNU General Public License v3.0](LICENSE).

## Recognition

All contributors will be recognized in our community. Significant contributions may result in commit access and maintainer status.

Thank you for contributing to a more open, private, and censorship-resistant web!
