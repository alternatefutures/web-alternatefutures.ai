# Access Methods & Mirrors

This document outlines all the ways you can access the Alternate Futures website, ensuring censorship resistance and availability even if traditional access methods are blocked.

## Primary Access Methods

### 1. Traditional HTTPS
- **URL**: https://alternatefutures.ai
- **Status**: Primary access method
- **Notes**: Standard web access via centralized DNS

### 2. IPFS (InterPlanetary File System)
- **CID (latest)**: Will be updated with each deployment
- **IPFS Gateway**: https://ipfs.io/ipfs/[CID]
- **Fleek Gateway**: https://[CID].ipfs.cf-ipfs.com
- **Status**: Decentralized, censorship-resistant
- **Notes**: Access via any public IPFS gateway

### 3. IPNS (InterPlanetary Name System)
- **IPNS Address**: Coming soon
- **Access**: ipns://[IPNS_ADDRESS]
- **Status**: Mutable pointer to latest IPFS deployment
- **Notes**: Always points to the latest version

## Decentralized Alternatives

### ENS (Ethereum Name Service)
- **ENS Domain**: alternatefutures.eth (planned)
- **Access**: Use ENS-compatible browsers or extensions
- **Status**: Planned implementation
- **Notes**: Censorship-resistant naming via Ethereum blockchain

### Alternative IPFS Gateways

If the primary gateways are blocked or slow, try these public IPFS gateways:

```
https://ipfs.io/ipfs/[CID]
https://gateway.ipfs.io/ipfs/[CID]
https://cloudflare-ipfs.com/ipfs/[CID]
https://dweb.link/ipfs/[CID]
https://[CID].ipfs.dweb.link
https://ipfs.eth.aragon.network/ipfs/[CID]
https://ipfs.fleek.co/ipfs/[CID]
```

Replace `[CID]` with the current Content IDentifier listed in the release notes.

## Running Your Own IPFS Node

For maximum censorship resistance and privacy, run your own IPFS node:

### Install IPFS

```bash
# Using IPFS Desktop (GUI)
# Download from: https://github.com/ipfs/ipfs-desktop/releases

# Or using command line (macOS/Linux)
brew install ipfs

# Or using npm
npm install -g ipfs
```

### Access the Site

```bash
# Initialize IPFS (first time only)
ipfs init

# Start IPFS daemon
ipfs daemon

# Access the site locally
# Open in browser: http://localhost:8080/ipfs/[CID]
```

### Pin the Site

Help ensure availability by pinning the site to your node:

```bash
ipfs pin add [CID]
```

## Archive Downloads

Full static site archives are available for offline use and re-hosting:

### Latest Release Archive
- **GitHub Releases**: https://github.com/alternatefutures/web-alternatefutures.ai/releases
- **Format**: tar.gz, zip
- **Contents**: Complete static site build

### Verification

All releases include checksums for verification:

```bash
# Download checksums file
curl -O https://github.com/alternatefutures/web-alternatefutures.ai/releases/download/v[VERSION]/checksums.txt

# Verify archive
sha256sum -c checksums.txt
```

## Community Mirrors

Community members are encouraged to host mirrors. If you're hosting a public mirror, submit a PR to add it here:

### Official Mirrors
- Primary: https://alternatefutures.ai
- IPFS: See CID above

### Community Mirrors
- (Community mirrors will be listed here as they become available)

## Tor Hidden Service

**Status**: Planned for future implementation

A Tor hidden service will provide additional censorship resistance and privacy:
- Accessible via Tor Browser
- .onion address to be announced
- No DNS required, fully anonymous access

## Self-Hosting

You can self-host this website:

### 1. Clone and Build

```bash
# Clone repository
git clone https://github.com/alternatefutures/web-alternatefutures.ai.git
cd web-alternatefutures.ai

# Install dependencies
npm install

# Build static site
npm run build

# The built site is in the `out` directory
# Serve with any static file server
```

### 2. Using Docker

```bash
# Build Docker image
docker build -t alternatefutures-web .

# Run container
docker run -p 3000:3000 alternatefutures-web
```

### 3. Deploy to Your Own IPFS

```bash
# Build the site
npm run build

# Add to IPFS
ipfs add -r out/

# Note the returned CID and share it
```

## Current Deployment

### Latest Version Information

Check the [CHANGELOG.md](CHANGELOG.md) for the latest version information and corresponding IPFS CID.

**Current Release**: v0.1.0 (Update this with each release)
**IPFS CID**: [CID will be added upon next deployment]
**Release Date**: 2025-01-12

## Monitoring & Status

### Check Availability

```bash
# Check HTTPS availability
curl -I https://alternatefutures.ai

# Check IPFS availability (replace [CID])
ipfs cat /ipfs/[CID]/index.html
```

### Status Page

Visit our status page for real-time availability information:
- https://alternatefutures.ai/status

## Emergency Access

If all web-based access methods are unavailable:

1. **GitHub Repository**: Clone the repository and build locally
2. **IPFS via CLI**: Access via local IPFS node
3. **Archive Download**: Download and extract the latest release archive
4. **Community Mirrors**: Check community-hosted mirrors

## Adding New Access Methods

We're always looking to improve censorship resistance. Suggested methods:

- [ ] ENS domain registration
- [ ] Tor hidden service
- [ ] I2P eepsite
- [ ] ZeroNet deployment
- [ ] Freenet deployment
- [ ] Torrent/WebTorrent distribution
- [ ] Additional public IPFS pinning services

## Contributing

Help us maintain censorship resistance:

1. **Run an IPFS node** and pin our content
2. **Host a mirror** and submit it via PR
3. **Report blocking** if you encounter censorship
4. **Suggest improvements** to this document

## Questions?

- **GitHub Discussions**: For access method questions
- **Email**: system@alternatefutures.ai
- **Documentation**: https://docs.alternatefutures.ai

---

**Remember**: Freedom of information requires active participation. Help us stay accessible by running nodes, hosting mirrors, and spreading knowledge of alternative access methods.
