# Linear Ticket: Support Decentralized Git Hosting

**Type:** Enhancement
**Priority:** Low (Future consideration)
**Labels:** infrastructure, decentralization, gitops
**Estimate:** 5-8 points

---

## Summary

Investigate and implement support for decentralized git hosting platforms (Radicle, Gitopia, GitLab CE) to align with Alternate Futures' mission of distributed infrastructure and eliminate dependency on centralized GitHub.

---

## Problem Statement

Currently, our deployment architecture relies on GitHub as the git hosting provider. While GitHub provides excellent visibility and developer familiarity, it represents the **only proprietary component** in our otherwise 100% open source stack:

**Current Stack Licensing:**
- ✅ K3s (Apache 2.0)
- ✅ OpenTofu (MPL 2.0)
- ✅ Traefik (MIT)
- ✅ ArgoCD (Apache 2.0)
- ✅ Sealed Secrets (Apache 2.0)
- ✅ PostgreSQL (PostgreSQL License)
- ✅ Redis (BSD)
- ❌ **GitHub (Proprietary - Microsoft)**

This creates a philosophical misalignment with our marketing message: *"Host anything on distributed nodes keeping you up even when Centralized Services are down."*

---

## Proposed Solution

Implement support for decentralized git hosting alternatives while maintaining GitHub as an optional mirror for visibility.

### Recommended Primary: Radicle

**Why Radicle:**
- **Production Ready**: v1.5.0 released September 2025
- **True P2P**: Peer-to-peer network built on Git with custom gossip protocol
- **Censorship Resistant**: Run your own nodes, no single point of failure
- **Local-First**: Offline-capable with cryptographic signing
- **Open Source**: MIT + Apache 2.0 licenses
- **Feature Complete**: Web UI, CLI, TUI clients, issues/PRs as Git objects
- **Mission Aligned**: "Sovereign code forge" matches our distributed infrastructure values

**Architecture with Radicle:**
```
Developer → Radicle P2P Network (primary)
                ↓
            ArgoCD watches Radicle
                ↓
            K3s Deployment

Radicle → GitHub (optional read-only mirror for visibility)
```

---

## Alternative Options Researched

### Option 1: Radicle (Recommended)
- **Status**: ✅ Production (v1.5.0)
- **Architecture**: P2P gossip network + Git
- **License**: MIT/Apache 2.0
- **Pros**: Truly decentralized, no blockchain complexity, offline-first
- **Cons**: Smaller ecosystem than GitHub, less familiar to contributors
- **Sources**: https://radicle.xyz

### Option 2: Gitopia
- **Status**: ✅ Production
- **Architecture**: Blockchain-based with DAO governance
- **License**: Unknown
- **Pros**: Permanent storage, built-in incentivization mechanisms
- **Cons**: Requires token infrastructure (LORE token), blockchain overhead
- **Sources**: https://docs.gitopia.com/

### Option 3: Self-Hosted GitLab CE
- **Status**: ✅ Production (mature)
- **Architecture**: Traditional self-hosted platform
- **License**: MIT
- **Pros**: Feature-rich, familiar, complete CI/CD, widely used
- **Cons**: Still centralized (single server), requires hosting/maintenance
- **Sources**: https://gitlab.com/gitlab-org/gitlab-foss

### Option 4: Hybrid Approach
- **Primary**: Radicle or GitLab CE
- **Backup**: Radicle (if GitLab is primary)
- **Visibility Mirror**: GitHub (read-only)
- **Deployment**: ArgoCD watches primary repo

---

## Technical Requirements

### Integration Points to Update

1. **ArgoCD Configuration**
   - Add Radicle repository connection
   - Configure authentication (SSH keys, cryptographic identity)
   - Test webhook/polling mechanisms for Radicle

2. **Developer Workflow**
   - Document `rad` CLI setup
   - Create onboarding guide for Radicle
   - Set up GitHub mirroring (if applicable)

3. **CI/CD Pipeline**
   - Verify GitHub Actions alternatives (Radicle CI capabilities)
   - Migrate workflows if needed
   - Test deployment triggers from Radicle

4. **Infrastructure as Code**
   - Update OpenTofu modules to support Radicle
   - Add Sealed Secrets for Radicle credentials
   - Configure ingress for Radicle web interface (if self-hosting nodes)

---

## Marketing Value

**Before:**
> "Alternate Futures is built on 100% open source... except git hosting."

**After:**
> "Alternate Futures: From code to cloud, fully distributed. Our repositories live on Radicle's P2P network, deployed to decentralized infrastructure. When centralized services go down, we stay up."

**README.md Badge:**
```markdown
🌐 **Distributed from the Start**
- Code: Radicle P2P Network
- Infra: K3s + OpenTofu + Traefik
- Deployment: ArgoCD GitOps

⭐ Also mirrored on [GitHub](https://github.com/alternatefutures) for visibility
```

---

## Implementation Phases

### Phase 1: Research & Proof of Concept (2-3 days)
- [ ] Set up Radicle node locally
- [ ] Test repository creation and cloning
- [ ] Verify ArgoCD can watch Radicle repos
- [ ] Document authentication mechanisms
- [ ] Test Collaborative Objects (issues, PRs)

### Phase 2: Migration Planning (1-2 days)
- [ ] Create migration checklist for all repos
- [ ] Document GitHub → Radicle migration process
- [ ] Set up GitHub mirroring automation
- [ ] Plan rollback strategy

### Phase 3: Production Deployment (3-5 days)
- [ ] Migrate alternatefutures-backend to Radicle
- [ ] Migrate alternatefutures-auth to Radicle
- [ ] Migrate home (marketing site) to Radicle
- [ ] Configure ArgoCD to watch Radicle
- [ ] Set up GitHub read-only mirrors
- [ ] Update documentation and README files

### Phase 4: Validation (1 day)
- [ ] Test end-to-end deployment from Radicle
- [ ] Verify GitHub mirroring works
- [ ] Confirm rollback procedure
- [ ] Update team documentation

---

## Success Metrics

- ✅ All repositories accessible via Radicle P2P network
- ✅ ArgoCD successfully deploys from Radicle repos
- ✅ GitHub mirrors update automatically within 5 minutes of Radicle push
- ✅ Zero downtime during migration
- ✅ Developer onboarding time < 30 minutes
- ✅ 100% open source stack (no proprietary dependencies)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Radicle ecosystem smaller than GitHub | Medium | Maintain GitHub mirror for contributor familiarity |
| ArgoCD Radicle integration issues | High | Thoroughly test in staging, have GitHub fallback ready |
| Team learning curve | Low | Create detailed documentation, pair programming sessions |
| Radicle node availability | Medium | Run multiple seed nodes, use GitHub mirror as backup |
| Migration complexity | Medium | Phased rollout, one repo at a time |

---

## Dependencies

- Current deployment architecture (ALT-92) must be stable
- ArgoCD deployment must be operational
- Team capacity for research & migration

---

## References

### Research Documents
- `/Users/wonderwomancode/Projects/alternatefutures/web-alternatefutures.ai/deployment-spec/phase0-research.md`

### Verified Sources
- [1] Radicle Official: https://radicle.xyz
- [2] Radicle v1.5.0 Release (Sept 2025)
- [3] Gitopia Docs: https://docs.gitopia.com/
- [4] IPVC (Inactive): https://github.com/martindbp/ipvc
- [5] Decentralized Git Alternatives: Multiple sources (see research doc)

### Related Tickets
- ALT-92: Auth Service Migration ✅ MERGED
- ALT-137: Add request timeouts to auth service calls
- ALT-138: Add integration tests for auth service communication
- ALT-139: Improve error logging in auth service calls
- ALT-140: Make service token expiry configurable

---

## Open Questions

1. Does Radicle support private repositories? (Answer: Yes, via private nodes)
2. What's the bandwidth requirement for seeding Radicle repos?
3. Can we run Radicle nodes on the same K3s cluster?
4. How do Radicle's Collaborative Objects (issues/PRs) compare to GitHub?
5. What's the disaster recovery process if all Radicle seeds go down?

---

## Decision: Deferred

**Current Decision**: Use GitHub for initial deployment to accelerate time-to-production.

**Future Revisit**: After successful deployment of backend, auth, and frontend services on K3s with ArgoCD, revisit Radicle migration to achieve 100% decentralized stack.

**Estimated Timeline**: Q2 2025 (after stable production deployment)

---

**Created**: November 8, 2025
**Status**: Backlog (Future Enhancement)
**Assignee**: TBD
**Epic**: Infrastructure Decentralization
