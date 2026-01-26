# Code Quality Automation

This document explains how coding standards are automatically enforced in the backend.

---

## 🛠️ Tools Overview

### 1. **ESLint** - Code Quality Rules
- Enforces TypeScript best practices
- Checks naming conventions (camelCase, PascalCase, UPPER_CASE)
- Prevents use of `any` type
- Catches unused variables
- Enforces `===` instead of `==`

### 2. **Prettier** - Code Formatting
- Consistent code formatting across the team
- Automatic code style fixes
- Single quotes, trailing commas, 100 char line width

### 3. **Husky** - Git Hooks
- Runs checks before commits
- Prevents bad code from being committed

### 4. **lint-staged** - Pre-commit Linting
- Only lints files staged for commit (faster)
- Auto-fixes issues before commit

### 5. **commitlint** - Commit Message Validation
- Enforces conventional commit format
- Ensures meaningful commit messages

---

## 🚀 Automated Checks

### Pre-Commit Checks (Runs automatically on `git commit`)

When you run `git commit`, the following happens automatically:

1. **ESLint** checks and fixes TypeScript code
2. **Prettier** formats the code
3. **Prisma Format** formats schema files
4. If any check fails, the commit is **blocked**

### Commit Message Validation

When you commit, your message must follow this format:

```
<type>(<scope>): <subject>

<optional body>
```

**Valid commit types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Build/tooling changes

**Examples:**
```bash
✅ VALID
git commit -m "feat(auth): add JWT authentication"
git commit -m "fix(users): resolve email validation bug"
git commit -m "docs(api): update Swagger documentation"

❌ INVALID
git commit -m "Added stuff"          # No type
git commit -m "Fix Bug"              # Wrong format
git commit -m "FEAT(auth): add jwt"  # Uppercase type
git commit -m "feat(auth): Add JWT." # Capitalized subject, has period
```

---

## 🔧 Manual Commands

### Lint Your Code

```bash
cd backend

# Check for linting errors
pnpm run lint

# Check and auto-fix linting errors
pnpm run lint:fix
```

### Format Your Code

```bash
cd backend

# Format all files
pnpm run format

# Check if files are formatted (without fixing)
pnpm run format:check
```

### Format Prisma Schema

```bash
cd backend

# Format schema.prisma file
pnpm run prisma:format
```

### Run All Checks (CI/CD)

```bash
cd backend

# Run format check + lint + tests
pnpm run code:check
```

---

## 📋 What Gets Checked?

### ESLint Rules Enforced

#### **Naming Conventions**
```typescript
// ✅ PASS
const userId = 1;                    // camelCase for variables
const MAX_RETRIES = 3;               // UPPER_CASE for constants
class UserService {}                 // PascalCase for classes
enum Role { ADMIN = 'ADMIN' }        // UPPER_CASE for enum values

// ❌ FAIL
const UserId = 1;                    // Should be camelCase
const user_id = 1;                   // Should be camelCase
class userService {}                 // Should be PascalCase
enum Role { admin = 'admin' }        // Should be UPPER_CASE
```

#### **No 'any' Type**
```typescript
// ✅ PASS
function getUser(id: number): User {
  return users.find(u => u.id === id);
}

// ❌ FAIL - ESLint will error
function getUser(id: any): any {
  return users.find(u => u.id === id);
}
```

#### **No Unused Variables**
```typescript
// ✅ PASS
const name = 'John';
console.log(name);

// ✅ PASS - Prefixed with _ to indicate intentionally unused
const { password: _, ...user } = userData;

// ❌ FAIL
const name = 'John';  // Declared but never used
```

#### **Use === Instead of ==**
```typescript
// ✅ PASS
if (value === 5) {}
if (value !== null) {}

// ❌ FAIL
if (value == 5) {}   // Should use ===
if (value != null) {} // Should use !==
```

#### **No console.log (warning)**
```typescript
// ⚠️ WARNING - Should use logger
console.log('Debug info');

// ✅ PASS
console.error('Error occurred');  // Allowed
console.warn('Warning message');  // Allowed
```

### Prettier Rules Applied

```typescript
// Before Prettier
const user={name:"John",age:30,email:"john@example.com"}

// After Prettier
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
};
```

- Single quotes (`'`) instead of double quotes (`"`)
- Trailing commas
- 2 spaces indentation
- 100 characters max line width
- Semicolons required

---

## 🔍 How to Fix Issues

### ESLint Errors

If you see ESLint errors:

```bash
# Auto-fix most issues
pnpm run lint:fix

# If some errors can't be auto-fixed, fix manually
```

**Common fixes:**
```typescript
// Error: no-explicit-any
// Before
function process(data: any) {}
// After
function process(data: UserData) {}

// Error: naming-convention
// Before
const UserID = 1;
// After
const userId = 1;

// Error: no-unused-vars
// Before
const unusedVar = 'value';
// After - Remove it or prefix with _
const _unusedVar = 'value';
```

### Prettier Issues

```bash
# Format all files
pnpm run format
```

### Commit Message Issues

If commitlint blocks your commit:

```bash
# ❌ Blocked
git commit -m "Fixed bug"

# Error message shown:
# subject may not be empty [subject-empty]
# type may not be empty [type-empty]

# ✅ Fix it
git commit -m "fix(users): resolve login validation issue"
```

---

## 🚫 Bypassing Checks (NOT RECOMMENDED)

### Skip Pre-commit Hooks

```bash
# NOT RECOMMENDED - Only use in emergencies
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning**: Bypassing checks can lead to:
- Inconsistent code style
- Type errors in production
- Merge conflicts
- Failed CI/CD pipelines

**When to bypass:**
- Emergency hotfix (very rare)
- Working on experimental branch
- Temporary WIP commit (will be squashed later)

---

## 🔄 CI/CD Integration

### GitHub Actions / GitLab CI

Add this to your CI pipeline:

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: cd backend && pnpm install

      - name: Check formatting
        run: cd backend && pnpm run format:check

      - name: Lint
        run: cd backend && pnpm run lint

      - name: Run tests
        run: cd backend && pnpm run test
```

---

## 📊 VSCode Integration (Recommended)

### Install Extensions

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Prisma** - `Prisma.prisma`

### VSCode Settings

Add to `.vscode/settings.json` (in project root):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

This will:
- Format code on save
- Auto-fix ESLint issues on save
- Show errors inline as you type

---

## 🧪 Testing the Setup

### Test Pre-commit Hook

```bash
cd backend

# Create a file with issues
cat > src/test-file.ts << 'EOF'
const UserId=1
function test(data:any) {
  console.log(data)
}
EOF

# Try to commit
git add src/test-file.ts
git commit -m "test"

# Result: Commit will be blocked with errors shown
# ESLint will show naming convention and 'any' type errors
```

### Test Commit Message Validation

```bash
# ❌ This will fail
git commit -m "fixed bug"

# ✅ This will pass
git commit -m "fix(users): resolve login validation bug"
```

---

## 📝 Configuration Files Reference

All configuration files are in the `backend/` directory:

| File | Purpose |
|------|---------|
| `eslint.config.mjs` | ESLint rules and naming conventions |
| `.prettierrc` | Prettier formatting rules |
| `commitlint.config.js` | Commit message format rules |
| `.lintstagedrc.js` | Pre-commit file processing |
| `.husky/pre-commit` | Pre-commit hook script |
| `.husky/commit-msg` | Commit message validation hook |

---

## 🎯 Benefits

### For Individual Developers
- ✅ Catch errors before commit
- ✅ Consistent code style automatically
- ✅ No manual formatting needed
- ✅ Learn best practices through lint errors

### For the Team
- ✅ Consistent codebase
- ✅ Easier code reviews
- ✅ Fewer bugs in production
- ✅ Better onboarding for new developers

### For CI/CD
- ✅ Faster pipeline execution
- ✅ Fewer failed builds
- ✅ Higher code quality

---

## 🆘 Troubleshooting

### Hooks Not Running

```bash
# Reinstall hooks
cd backend
rm -rf node_modules
pnpm install

# Or manually
chmod +x ../.husky/pre-commit
chmod +x ../.husky/commit-msg
```

### ESLint Not Finding Config

```bash
# Ensure you're in the backend directory
cd backend
pnpm run lint
```

### Prettier Conflicts with ESLint

Don't worry - this is already handled! We use `eslint-config-prettier` which disables conflicting ESLint rules.

---

## 📚 Learn More

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Questions?** Refer to [CODING_STANDARDS.md](./CODING_STANDARDS.md) for detailed coding guidelines.
