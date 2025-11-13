# Development Workflow

This document outlines the development workflow, branching strategy, and best practices for contributing to the Alternate Futures website.

## Branch Structure

Our repository follows a three-tier branching strategy designed for stability, testing, and rapid iteration.

```
main     ← Production (protected, requires PR)
  ↑
staging  ← Pre-production testing (stable, tested features)
  ↑
develop  ← Active development (integration branch)
  ↑
feature/* ← Feature branches (individual work)
```

### Branch Purposes

#### `main` - Production Branch
- **Purpose**: Production-ready code deployed to live site
- **Protection**: Protected branch, requires pull request reviews
- **Deployment**: Auto-deploys to https://alternatefutures.ai via Fleek/IPFS
- **Merge from**: `staging` only
- **Stability**: Must always be deployable
- **Testing**: Fully tested, QA approved

#### `staging` - Pre-Production Branch
- **Purpose**: Final testing and validation before production
- **Protection**: Semi-protected, limited direct commits
- **Deployment**: May deploy to staging environment
- **Merge from**: `develop` only
- **Stability**: Should be stable, undergoing final QA
- **Testing**: Feature-complete, integration tested

#### `develop` - Development Branch
- **Purpose**: Integration branch for ongoing development
- **Protection**: Open for direct commits by maintainers
- **Merge from**: Feature branches, hotfix branches
- **Stability**: May be unstable, active development
- **Testing**: Unit tests passing, features may be incomplete

#### `feature/*` - Feature Branches
- **Purpose**: Individual feature development
- **Naming**: `feature/description-of-feature`
- **Merge to**: `develop`
- **Lifetime**: Delete after merging
- **Examples**:
  - `feature/add-blog-section`
  - `feature/update-consulting-page`
  - `feature/improve-mobile-nav`

## Development Workflow

### 1. Starting New Work

Always create feature branches from `develop`:

```bash
# Update your local develop branch
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-contact-form
```

### 2. During Development

Make commits with clear, descriptive messages:

```bash
# Stage your changes
git add <files>

# Commit with descriptive message
git commit -m "feat: add contact form component"

# Push to remote regularly
git push origin feature/your-feature-name
```

**Commit Message Format:**
```
type: brief description

Longer explanation if needed

- Bullet points for details
- Multiple changes listed clearly
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### 3. Keeping Your Branch Updated

Regularly sync with `develop` to avoid conflicts:

```bash
# While on your feature branch
git fetch origin
git rebase origin/develop

# Or if you prefer merging:
git merge origin/develop
```

### 4. Creating a Pull Request

When your feature is ready:

```bash
# Push your latest changes
git push origin feature/your-feature-name

# Create PR via GitHub web interface or CLI
gh pr create --base develop --head feature/your-feature-name
```

**PR Checklist:**
- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (`npm test` when available)
- [ ] No new security vulnerabilities (`npm audit`)
- [ ] Documentation updated if needed
- [ ] Clear PR description explaining changes
- [ ] Screenshots/videos for UI changes
- [ ] Linked to related issues

### 5. Code Review Process

**For Authors:**
- Respond to feedback promptly
- Make requested changes as new commits
- Push updates to the same branch
- Request re-review when ready

**For Reviewers:**
- Review within 48 hours when possible
- Provide constructive feedback
- Test locally if significant changes
- Approve when satisfied

### 6. Merging to Develop

Once approved:

```bash
# Merge the PR (via GitHub interface or CLI)
gh pr merge --squash feature/your-feature-name

# Delete the feature branch (automated or manual)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Promotion Workflow

### Develop → Staging

When features are ready for pre-production testing:

```bash
# Switch to staging
git checkout staging
git pull origin staging

# Merge develop (or specific commits)
git merge develop

# Or cherry-pick specific commits
git cherry-pick <commit-hash>

# Push to staging
git push origin staging

# Test thoroughly on staging
```

**Staging Testing Checklist:**
- [ ] All features work as expected
- [ ] No regressions in existing functionality
- [ ] Mobile responsive on real devices
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance acceptable (load times, bundle size)
- [ ] Security headers verified
- [ ] No console errors

### Staging → Main (Production Release)

When staging is fully tested and approved:

```bash
# Switch to main
git checkout main
git pull origin main

# Merge staging
git merge staging

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push to main (triggers production deployment)
git push origin main
git push origin v1.0.0

# Update CHANGELOG.md
# Document release in GitHub Releases
```

**Pre-Production Checklist:**
- [ ] Full QA testing completed on staging
- [ ] Stakeholder approval received
- [ ] CHANGELOG.md updated
- [ ] Release notes prepared
- [ ] Rollback plan documented
- [ ] Monitoring plan in place

## Hotfix Workflow

For urgent production fixes:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Make the fix
# Commit changes
git commit -m "fix: resolve critical security issue"

# Create PR targeting main
gh pr create --base main --head hotfix/critical-bug-fix

# After merge, backport to develop
git checkout develop
git cherry-pick <hotfix-commit-hash>
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

**MAJOR.MINOR.PATCH** (e.g., 1.2.3)

- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

### Creating a Release

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Update version in package.json
npm version minor  # or major/patch

# 3. Update CHANGELOG.md
# Add release notes, features, fixes

# 4. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.2.0"

# 5. Tag the release
git tag -a v1.2.0 -m "Release version 1.2.0"

# 6. Push to remote
git push origin main --tags

# 7. Build and verify
npm run build

# 8. Generate IPFS CID
ipfs add -r out/

# 9. Create GitHub Release
gh release create v1.2.0 \
  --title "v1.2.0 - Feature Release" \
  --notes "$(cat release-notes.md)"

# 10. Update MIRRORS.md with new IPFS CID
```

## Best Practices

### Branch Management

✅ **DO:**
- Keep feature branches small and focused
- Delete branches after merging
- Regularly sync with develop
- Use descriptive branch names
- Create PRs early for feedback

❌ **DON'T:**
- Commit directly to main
- Let feature branches live for weeks
- Mix unrelated changes in one branch
- Use vague branch names like "updates" or "fixes"

### Commit Practices

✅ **DO:**
- Write clear, descriptive commit messages
- Make atomic commits (one logical change)
- Commit often, push regularly
- Reference issues in commits (`fixes #123`)

❌ **DON'T:**
- Commit WIP code to shared branches
- Write vague messages like "fix stuff"
- Make massive commits with unrelated changes
- Commit secrets or API keys

### Testing Before Merge

**Always verify:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Lint
npm run lint

# Build
npm run build

# Security audit
npm audit
```

## Conflict Resolution

When you encounter merge conflicts:

```bash
# 1. Fetch latest changes
git fetch origin

# 2. Attempt merge/rebase
git rebase origin/develop
# or
git merge origin/develop

# 3. Resolve conflicts in your editor
# Git will mark conflicts with <<<<<<<, =======, >>>>>>>

# 4. Stage resolved files
git add <resolved-files>

# 5. Continue rebase/merge
git rebase --continue
# or
git commit

# 6. Push (may need force push for rebase)
git push origin feature/your-branch --force-with-lease
```

## Emergency Procedures

### Rolling Back a Deployment

If a critical issue is discovered in production:

```bash
# 1. Identify the last good commit
git log --oneline

# 2. Revert to previous commit
git revert <bad-commit-hash>

# 3. Push immediately
git push origin main

# 4. Create hotfix for proper fix
# Follow hotfix workflow above
```

### Broken Build on Main

If main branch build is broken:

```bash
# 1. Identify breaking commit
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>

# 2. Revert the breaking commit
git revert <breaking-commit>
git push origin main

# 3. Create issue for proper fix
# 4. Fix on feature branch and test thoroughly
```

## Resources

### Quick Reference

```bash
# Start new feature
git checkout develop && git pull && git checkout -b feature/name

# Update your branch
git fetch origin && git rebase origin/develop

# Create PR
gh pr create --base develop

# Promote to staging
git checkout staging && git merge develop && git push

# Release to production
git checkout main && git merge staging && git tag v1.0.0 && git push --tags
```

### Related Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [GOVERNANCE.md](GOVERNANCE.md) - Decision-making process
- [SECURITY.md](SECURITY.md) - Security policies
- [CHANGELOG.md](CHANGELOG.md) - Version history

## Questions?

- **GitHub Discussions**: For workflow questions
- **GitHub Issues**: Report workflow problems
- **Email**: system@alternatefutures.ai

---

**Remember**: Good workflow habits lead to stable software. When in doubt, ask in discussions before pushing!
