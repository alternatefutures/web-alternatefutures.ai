# Reproducible Builds

## Overview

Reproducible builds allow anyone to independently verify that the deployed website matches the published source code. This is critical for security, transparency, and trust in open-source projects.

This document explains how to reproduce our builds and verify their authenticity.

## Why Reproducible Builds?

**Security**: Verify that deployed code matches source (no backdoors or tampering)
**Transparency**: Anyone can audit what's actually running
**Trust**: Don't trust, verify
**Supply Chain Security**: Detect compromised build systems

## Build Environment

To achieve reproducible builds, use the exact environment specified:

### Required Tools

```bash
# Node.js version (specified in .nvmrc)
node --version  # Should be v20.x.x

# npm version
npm --version   # Should be 10.x.x or higher

# Operating System
# Builds are reproducible across Linux, macOS, and Windows
```

### Using the Correct Node Version

```bash
# Install nvm (Node Version Manager) if you don't have it
# Visit: https://github.com/nvm-sh/nvm

# Use the specified Node version
nvm install
nvm use

# Verify
node --version
```

## Build Process

### 1. Clone the Repository

```bash
# Clone at specific tag/commit for verification
git clone https://github.com/alternatefutures/web-alternatefutures.ai.git
cd web-alternatefutures.ai

# Checkout specific version (replace v0.1.0 with version you're verifying)
git checkout v0.1.0

# Verify git commit
git log -1 --format="%H"
```

### 2. Install Dependencies

```bash
# Clean install (ensures consistent dependency resolution)
rm -rf node_modules package-lock.json
npm install

# Verify dependency integrity
npm audit
```

### 3. Build the Site

```bash
# Clean previous builds
rm -rf .next out

# Build static site
npm run build
```

### 4. The Build Output

The static site is generated in the `out/` directory. This is what gets deployed.

## Verifying Builds

### Checksums

Each release includes checksums for verification:

```bash
# Generate checksum of your build
find out -type f -exec sha256sum {} \; | sort -k 2 | sha256sum

# Compare with published checksum in GitHub release
# They should match exactly
```

### IPFS CID Verification

IPFS uses content addressing - the CID (Content Identifier) is a hash of the content:

```bash
# Add your build to IPFS
ipfs add -r out/

# The returned CID should match the published CID
# If it matches, your build is identical to the deployed version
```

### File-by-File Comparison

```bash
# Download deployed version
# (Replace [CID] with actual CID from release)
ipfs get /ipfs/[CID] -o deployed

# Compare with your build
diff -r out/ deployed/

# No output means they're identical
```

## Known Build Variations

### Timestamps

Next.js may embed build timestamps. We configure Next.js to minimize these:

```typescript
// next.config.ts includes:
output: 'export',
compress: true,
```

### Source Maps

Source maps are not included in production builds:

```bash
# Verify no .map files
find out -name "*.map"
# Should return no results
```

## Reproducibility Checklist

When reproducing a build, verify:

- [ ] Correct Node.js version (from `.nvmrc`)
- [ ] Clean `node_modules` and fresh install
- [ ] Correct git commit/tag checked out
- [ ] No local `.env.local` or other local config
- [ ] Clean build directory (`.next` and `out` removed)
- [ ] Build completes without errors
- [ ] Generated IPFS CID matches published CID
- [ ] File checksums match published checksums

## Automated Verification

### Using Docker

For the most reproducible environment, use Docker:

```bash
# Build using Docker
docker build -t alternatefutures-verify .

# Extract built files
docker run --rm alternatefutures-verify tar -czf - /app/out | tar -xzf -

# Verify checksums
sha256sum -r out/
```

### CI/CD Verification

Our GitHub Actions workflow produces reproducible builds:

```bash
# View workflow file
cat .github/workflows/build.yml

# Workflow builds are triggered on:
# - Push to main branch
# - Pull requests
# - Tagged releases
```

## Release Process

### For Maintainers

When creating a release:

1. **Tag the release**:
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git push origin v0.2.0
   ```

2. **Build locally**:
   ```bash
   npm run build
   ```

3. **Generate checksums**:
   ```bash
   find out -type f -exec sha256sum {} \; | sort -k 2 > checksums.txt
   sha256sum checksums.txt
   ```

4. **Deploy to IPFS**:
   ```bash
   ipfs add -r out/
   # Note the returned CID
   ```

5. **Create GitHub Release**:
   - Include IPFS CID
   - Include checksums.txt
   - Include build instructions
   - Link to this documentation

6. **Update MIRRORS.md**:
   - Add new IPFS CID
   - Update version information

## Verification by Community

We encourage the community to verify our builds:

### Report Your Verification

If you successfully reproduce a build:

1. Create a GitHub Issue titled "Build Verification: v[VERSION]"
2. Include:
   - Your environment (OS, Node version)
   - IPFS CID you generated
   - Checksums
   - Whether it matches the official release

### Hall of Verification

Community members who verify builds will be acknowledged in release notes.

## Troubleshooting

### Different IPFS CID

**Possible causes**:
- Different Node.js version
- Modified source code
- Stale `node_modules`
- Local configuration files

**Solution**:
```bash
# Start completely fresh
git clean -fdx
git checkout [TAG]
nvm use
npm install
npm run build
```

### Timestamp Differences

If only timestamps differ, this is expected for certain metadata files. The functional code should be identical.

### Platform Differences

Builds should be identical across platforms. If not:
- Check Node.js version exactly matches
- Ensure line endings are consistent (use `.gitattributes`)
- Verify no platform-specific scripts in package.json

## Future Improvements

We're working on:

- [ ] Fully deterministic builds (eliminate all timestamps)
- [ ] Automated build verification in CI/CD
- [ ] Signed releases with GPG
- [ ] Build attestations
- [ ] Binary transparency log

## Resources

- [Reproducible Builds Project](https://reproducible-builds.org/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Next.js Build Output](https://nextjs.org/docs/advanced-features/static-html-export)

## Questions?

- **GitHub Discussions**: For build reproducibility questions
- **GitHub Issues**: Report verification results or problems
- **Email**: system@alternatefutures.ai

---

**Remember**: Don't trust, verify. Reproducible builds give you the power to independently confirm that what's running matches the source code.
