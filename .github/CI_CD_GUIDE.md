# 🚀 CI/CD Pipeline Guide

Comprehensive guide for the GitHub Actions CI/CD pipelines configured for this project.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Setup Instructions](#setup-instructions)
4. [Secrets Configuration](#secrets-configuration)
5. [Deployment Strategy](#deployment-strategy)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The project uses **GitHub Actions** for continuous integration and continuous deployment with the following workflows:

### CI Pipelines
- **Backend CI** - Runs on every push/PR to backend
- **Frontend CI** - Runs on every push/PR to frontend
- **PR Checks** - Additional checks for all pull requests

### CD Pipelines
- **Backend CD** - Deploys backend to staging/production
- **Auto Labeling** - Automatically labels PRs based on changed files

### Benefits
- ✅ Automated testing on every commit
- ✅ Code quality enforcement
- ✅ Security scanning
- ✅ Automated deployments
- ✅ Docker image building and publishing
- ✅ Database migration management

---

## 📊 Workflows

### 1. Backend CI (`backend-ci.yml`)

**Trigger**: Push or PR to `main`/`develop` with backend changes

**Jobs**:
1. **Code Quality**
   - Prettier format check
   - ESLint linting
   - TypeScript type checking

2. **Unit Tests**
   - Runs all unit tests
   - Generates coverage report
   - Uploads to Codecov

3. **E2E Tests**
   - Spins up PostgreSQL and Redis
   - Runs database migrations
   - Executes end-to-end tests

4. **Build Test**
   - Builds production bundle
   - Verifies build output

5. **Docker Build**
   - Tests development Dockerfile
   - Tests production Dockerfile
   - Uses layer caching

6. **Security Audit**
   - Runs `pnpm audit`
   - Checks for vulnerabilities
   - Uploads audit report

**Duration**: ~5-7 minutes

### 2. Backend CD (`backend-cd.yml`)

**Trigger**:
- Push to `main` → Deploy to staging
- Git tags (`v*.*.*`) → Deploy to production

**Jobs**:
1. **Build and Push**
   - Builds production Docker image
   - Pushes to GitHub Container Registry
   - Tags: `latest`, `v1.0.0`, `main-abc123`
   - Multi-platform: `linux/amd64`, `linux/arm64`

2. **Deploy to Staging** (auto)
   - Updates staging environment
   - Runs health checks
   - Executes smoke tests

3. **Deploy to Production** (manual approval)
   - Updates production environment
   - Runs health checks
   - Sends notifications

4. **Database Migrations**
   - Runs `prisma migrate deploy`
   - Verifies migration status

**Duration**: ~10-15 minutes

### 3. Frontend CI (`frontend-ci.yml`)

**Trigger**: Push or PR to `main`/`develop` with frontend changes

**Jobs**:
1. **Code Quality**
   - ESLint linting
   - TypeScript type checking

2. **Build Test**
   - Builds Next.js production bundle
   - Uploads build artifacts

3. **Unit Tests**
   - Runs Jest tests (when configured)

4. **Lighthouse Performance**
   - Performance testing (optional)

**Duration**: ~3-5 minutes

### 4. PR Checks (`pr-checks.yml`)

**Trigger**: Any pull request

**Jobs**:
1. **PR Title Check**
   - Validates conventional commit format
   - Examples: `feat(backend): add auth`, `fix(frontend): login bug`

2. **Merge Conflict Check**
   - Detects merge conflicts

3. **Large File Check**
   - Prevents files >500KB

4. **Secret Scan**
   - Uses Gitleaks to detect secrets
   - Prevents credential leaks

5. **Dependency Review**
   - Checks for vulnerable dependencies
   - Blocks GPL/AGPL licenses

6. **Auto Label**
   - Labels PRs: `backend`, `frontend`, `docs`, etc.

**Duration**: ~2-3 minutes

---

## 🛠️ Setup Instructions

### 1. Enable GitHub Actions

1. Go to repository Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Set "Workflow permissions" to "Read and write permissions"
4. Save changes

### 2. Configure Environments

Create two environments in Settings → Environments:

#### Staging Environment
- **Name**: `staging`
- **URL**: `https://staging-api.yourdomain.com`
- **Deployment branches**: `main` only
- **Protection rules**: None (auto-deploy)

#### Production Environment
- **Name**: `production`
- **URL**: `https://api.yourdomain.com`
- **Deployment branches**: Tags only (`v*.*.*`)
- **Protection rules**:
  - ✅ Required reviewers (2 reviewers)
  - ✅ Wait timer (5 minutes)

### 3. Set Up Secrets

Go to Settings → Secrets and variables → Actions

Add the following **Repository Secrets**:

```bash
# Database
DATABASE_URL                  # Production database URL
DATABASE_READ_REPLICA_URL     # Production read replica URL

# AWS (if using AWS deployment)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Container Registry (if not using GHCR)
DOCKER_REGISTRY_URL
DOCKER_USERNAME
DOCKER_PASSWORD

# Optional: Codecov
CODECOV_TOKEN

# Optional: Notifications
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```

**Environment-specific secrets** (Settings → Environments → Environment → Add secret):

**Staging**:
```bash
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/db
FRONTEND_URL=https://staging.yourdomain.com
```

**Production**:
```bash
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/db
DATABASE_READ_REPLICA_URL=postgresql://user:pass@prod-replica.example.com:5432/db
FRONTEND_URL=https://yourdomain.com
```

### 4. Configure Deployment Commands

Edit `.github/workflows/backend-cd.yml` and replace placeholder deployment commands:

#### For AWS ECS/Fargate:
```yaml
- name: Deploy to production
  run: |
    aws ecs update-service \
      --cluster production-cluster \
      --service backend-service \
      --force-new-deployment \
      --region ${{ secrets.AWS_REGION }}
```

#### For Kubernetes:
```yaml
- name: Deploy to production
  run: |
    kubectl set image deployment/backend \
      backend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ needs.build-and-push.outputs.image-tag }} \
      --namespace production
```

#### For Docker Compose:
```yaml
- name: Deploy to production
  run: |
    ssh user@production-server << 'EOF'
      cd /app
      docker-compose pull backend
      docker-compose up -d backend
    EOF
```

---

## 🔐 Secrets Configuration

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | Production database connection string | `postgresql://user:pass@host:5432/db` |
| `DATABASE_READ_REPLICA_URL` | Read replica connection string | `postgresql://user:pass@replica:5432/db` |
| `GITHUB_TOKEN` | Automatically provided by GitHub | (auto) |

### Optional Secrets

| Secret Name | Description | When Needed |
|-------------|-------------|-------------|
| `CODECOV_TOKEN` | Codecov.io token | If using Codecov |
| `AWS_ACCESS_KEY_ID` | AWS access key | If deploying to AWS |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | If deploying to AWS |
| `SLACK_WEBHOOK_URL` | Slack notifications | If using Slack |

### How to Add Secrets

```bash
# Via GitHub CLI
gh secret set DATABASE_URL --body "postgresql://..."

# Or via GitHub UI
Settings → Secrets and variables → Actions → New repository secret
```

---

## 🚢 Deployment Strategy

### Development → Staging → Production

```mermaid
graph LR
    A[Developer Push] --> B[CI Checks]
    B --> C{Pass?}
    C -->|Yes| D[Merge to Main]
    C -->|No| E[Fix Issues]
    D --> F[Auto Deploy to Staging]
    F --> G[Manual Tests]
    G --> H{Ready?}
    H -->|Yes| I[Create Tag v1.0.0]
    H -->|No| J[More Changes]
    I --> K[Manual Approval]
    K --> L[Deploy to Production]
    L --> M[Run Migrations]
    M --> N[Health Checks]
```

### Branching Strategy

```bash
# Feature branch
feature/add-authentication → PR → main

# Hotfix
hotfix/fix-login-bug → PR → main → tag v1.0.1

# Main branch
main → auto-deploy to staging

# Release tag
git tag v1.0.0 → manual-deploy to production
```

### Versioning

Follow **Semantic Versioning** (semver):
- `v1.0.0` - Major release
- `v1.1.0` - Minor update (new features)
- `v1.1.1` - Patch (bug fixes)

```bash
# Create a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# This triggers production deployment
```

---

## 🧪 Testing Strategy

### Automated Tests

1. **Unit Tests** - Run on every commit
   ```bash
   pnpm run test
   ```

2. **E2E Tests** - Run on every PR
   ```bash
   pnpm run test:e2e
   ```

3. **Smoke Tests** - Run after deployment
   ```bash
   curl https://api.yourdomain.com/health
   ```

### Manual Testing Checklist

After deployment to staging:
- [ ] Login functionality works
- [ ] CRUD operations work
- [ ] Database queries are fast
- [ ] Health endpoints respond
- [ ] Logs are being generated
- [ ] Error handling works

---

## 🔧 Troubleshooting

### Issue 1: CI Pipeline Failing

**Check**: View workflow logs
```bash
# Via GitHub UI
Actions → Select workflow → View logs

# Via GitHub CLI
gh run list
gh run view <run-id> --log
```

**Common Causes**:
- Linting errors → Fix with `pnpm run lint:fix`
- Type errors → Fix with `pnpm exec tsc --noEmit`
- Test failures → Fix tests
- Build errors → Check build output

### Issue 2: Docker Build Fails

**Check**: Build logs in "Build and Push" step

**Common Causes**:
- Missing `.dockerignore` → Add it
- Node modules cache issue → Clear cache
- Memory limit → Increase runner memory

**Solution**:
```bash
# Test locally
cd backend
docker build -f Dockerfile -t test:latest .

# If successful, push will work
```

### Issue 3: Deployment Fails

**Check**: Deployment step logs

**Common Causes**:
- Wrong secrets → Verify in Settings → Secrets
- Permission issues → Check IAM roles (AWS)
- Network issues → Check VPC/security groups

**Solution**:
```bash
# Test deployment manually
# AWS ECS example:
aws ecs update-service --cluster prod --service backend --force-new-deployment

# Kubernetes example:
kubectl rollout restart deployment/backend -n production
```

### Issue 4: Database Migration Fails

**Check**: "Run Database Migrations" step

**Common Causes**:
- Invalid DATABASE_URL → Verify secret
- Migration conflict → Review migrations
- Connection timeout → Check network

**Solution**:
```bash
# Run manually
cd backend
DATABASE_URL="..." pnpm prisma migrate deploy

# Check status
DATABASE_URL="..." pnpm prisma migrate status
```

### Issue 5: Tests Pass Locally, Fail in CI

**Common Causes**:
- Environment differences
- Missing environment variables
- Timezone issues
- Race conditions

**Solution**:
```bash
# Run tests with CI environment
NODE_ENV=test pnpm run test

# Check for env-specific issues
echo $DATABASE_URL
```

### Issue 6: Secrets Not Available

**Error**: "Secret not found"

**Solution**:
1. Go to Settings → Secrets and variables → Actions
2. Add missing secret
3. Re-run workflow

### Issue 7: Merge Conflict in PR

**Error**: "Merge conflicts detected"

**Solution**:
```bash
# Update your branch
git checkout your-branch
git pull origin main
git merge main
# Resolve conflicts
git commit
git push
```

---

## 📊 Workflow Status Badges

Add to your README.md:

```markdown
![Backend CI](https://github.com/username/repo/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/username/repo/workflows/Frontend%20CI/badge.svg)
![PR Checks](https://github.com/username/repo/workflows/PR%20Checks/badge.svg)
```

---

## 🎯 Best Practices

### 1. Keep Workflows Fast
- ✅ Use caching for dependencies
- ✅ Run jobs in parallel
- ✅ Use matrix builds for multiple versions
- ✅ Skip unnecessary steps with `if` conditions

### 2. Security
- ✅ Never commit secrets
- ✅ Use GitHub Secrets
- ✅ Enable secret scanning
- ✅ Review dependency updates
- ✅ Use least-privilege IAM roles

### 3. Reliability
- ✅ Use `continue-on-error` for non-critical steps
- ✅ Add health checks after deployment
- ✅ Implement rollback strategy
- ✅ Monitor deployment metrics

### 4. Maintainability
- ✅ Document all secrets required
- ✅ Use reusable workflows
- ✅ Keep workflows DRY
- ✅ Add comments for complex logic

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Prisma Migrate in CI/CD](https://www.prisma.io/docs/guides/deployment/deploy-to-the-cloud)
- [Semantic Release](https://github.com/semantic-release/semantic-release)

---

## ✅ Checklist

### Initial Setup
- [ ] Enable GitHub Actions
- [ ] Create staging environment
- [ ] Create production environment
- [ ] Add required secrets
- [ ] Configure deployment commands
- [ ] Test CI pipeline with a PR
- [ ] Test CD pipeline with a tag

### Regular Maintenance
- [ ] Review failed workflows weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review workflow efficiency
- [ ] Update deployment scripts as needed

---

**Status**: ✅ CI/CD pipeline configured and ready!

**Next Steps**: Push code and create a PR to see the pipelines in action.
