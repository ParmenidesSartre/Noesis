# 🧪 Testing Guide

Comprehensive guide for writing and running tests in the backend application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Unit Tests](#writing-unit-tests)
5. [Writing E2E Tests](#writing-e2e-tests)
6. [Testing Utilities](#testing-utilities)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

---

## 🎯 Overview

### Testing Stack

- **Framework**: Jest
- **E2E**: Supertest
- **Coverage**: Jest Coverage
- **Utilities**: Custom test helpers

### Test Types

1. **Unit Tests** (`.spec.ts`)
   - Test individual functions/classes in isolation
   - Mock external dependencies
   - Fast execution (~ms per test)
   - Location: Next to source files (`*.service.spec.ts`)

2. **E2E Tests** (`.e2e-spec.ts`)
   - Test full API endpoints
   - Use real database (test database)
   - Slower execution (~seconds per test)
   - Location: `test/` directory

3. **Integration Tests** (future)
   - Test multiple modules working together
   - Use real dependencies when possible

---

## 📂 Test Structure

```
backend/
├── src/
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts       # Unit tests
│   │   ├── users.controller.ts
│   │   └── users.controller.spec.ts    # Unit tests
│   └── ...
├── test/
│   ├── app.e2e-spec.ts                 # E2E tests
│   ├── health.e2e-spec.ts              # E2E tests
│   ├── jest-e2e.json                   # E2E Jest config
│   ├── setup.ts                        # E2E setup
│   └── helpers/
│       └── test-utils.ts               # Test utilities
├── jest.config.js                      # Unit test config
└── coverage/                           # Coverage reports
```

---

## 🚀 Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode (auto-rerun on changes)
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run specific test file
pnpm run test users.service.spec.ts

# Run tests matching pattern
pnpm run test --testNamePattern="should create a user"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run specific E2E test file
pnpm run test:e2e health.e2e-spec.ts

# Debug E2E tests
pnpm run test:debug
```

### Coverage Reports

```bash
# Generate coverage report
pnpm run test:cov

# View HTML coverage report
open coverage/lcov-report/index.html
```

**Coverage Thresholds**:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

---

## ✍️ Writing Unit Tests

### Basic Unit Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('myMethod', () => {
    it('should return expected value', () => {
      const result = service.myMethod();
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking Dependencies

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should find all users', async () => {
    const mockUsers = [{ id: 1, name: 'Test' }];
    mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

    const result = await service.findAll();

    expect(result).toEqual(mockUsers);
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
  });
});
```

### Testing Exceptions

```typescript
it('should throw NotFoundException when user not found', async () => {
  mockPrismaService.user.findUnique.mockResolvedValue(null);

  await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
});
```

### Testing Async Functions

```typescript
it('should create a user', async () => {
  const createDto = { email: 'test@example.com', name: 'Test' };
  const mockUser = { id: 1, ...createDto };

  mockPrismaService.user.create.mockResolvedValue(mockUser);

  const result = await service.create(createDto);

  expect(result).toEqual(mockUser);
  expect(mockPrismaService.user.create).toHaveBeenCalledWith({
    data: createDto,
  });
});
```

---

## 🌐 Writing E2E Tests

### Basic E2E Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

### Testing POST Requests

```typescript
it('/users (POST)', () => {
  const createUserDto = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
    role: 'STUDENT',
  };

  return request(app.getHttpServer())
    .post('/api/v1/users')
    .send(createUserDto)
    .expect(201)
    .expect((res) => {
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(createUserDto.email);
      expect(res.body).not.toHaveProperty('password'); // Should not return password
    });
});
```

### Testing Authentication

```typescript
describe('Protected endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get token
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin123!' });

    authToken = response.body.accessToken;
  });

  it('should access protected route with token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should reject without token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);
  });
});
```

### Database Setup/Teardown

```typescript
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupDatabase } from './helpers/test-utils';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests...
});
```

---

## 🛠️ Testing Utilities

### Available Utilities (`test/helpers/test-utils.ts`)

#### 1. Create Test App
```typescript
import { createTestApp } from './helpers/test-utils';

const { app, moduleRef } = await createTestApp({
  imports: [AppModule],
});
```

#### 2. Cleanup Database
```typescript
import { cleanupDatabase } from './helpers/test-utils';

await cleanupDatabase(prisma);
```

#### 3. Generate Test Data
```typescript
import { generateTestUser, generateTestStudent } from './helpers/test-utils';

const userData = generateTestUser({ role: 'TEACHER' });
const studentData = generateTestStudent({ status: 'ACTIVE' });
```

#### 4. Authenticated Requests
```typescript
import { authenticatedRequest } from './helpers/test-utils';

await authenticatedRequest(app, token)
  .get('/api/v1/users/me')
  .expect(200);
```

#### 5. Wait For Condition
```typescript
import { waitFor } from './helpers/test-utils';

await waitFor(async () => {
  const user = await prisma.user.findUnique({ where: { id: 1 } });
  return user !== null;
}, 5000);
```

---

## 📚 Best Practices

### 1. Test Organization

✅ **DO**:
```typescript
describe('UsersService', () => {
  describe('findAll', () => {
    it('should return all users', () => {});
    it('should return empty array when no users', () => {});
  });

  describe('findOne', () => {
    it('should return a user by id', () => {});
    it('should throw NotFoundException', () => {});
  });
});
```

❌ **DON'T**:
```typescript
describe('UsersService', () => {
  it('test everything', () => {
    // Testing multiple things in one test
  });
});
```

### 2. Test Independence

✅ **DO**: Each test should be independent
```typescript
beforeEach(async () => {
  await cleanupDatabase(prisma);
  jest.clearAllMocks();
});
```

❌ **DON'T**: Tests depending on each other
```typescript
it('create user', () => { /* creates user with id 1 */ });
it('get user', () => { /* assumes user with id 1 exists */ });
```

### 3. Descriptive Test Names

✅ **DO**:
```typescript
it('should throw ConflictException when email already exists', () => {});
it('should return 404 when user not found', () => {});
```

❌ **DON'T**:
```typescript
it('test 1', () => {});
it('works', () => {});
```

### 4. Arrange-Act-Assert Pattern

```typescript
it('should create a user', async () => {
  // Arrange
  const createDto = { email: 'test@example.com', name: 'Test' };
  const mockUser = { id: 1, ...createDto };
  mockPrismaService.user.create.mockResolvedValue(mockUser);

  // Act
  const result = await service.create(createDto);

  // Assert
  expect(result).toEqual(mockUser);
  expect(mockPrismaService.user.create).toHaveBeenCalled();
});
```

### 5. Mock Only What You Need

✅ **DO**: Mock external dependencies
```typescript
const mockPrismaService = {
  user: {
    findMany: jest.fn(),
  },
};
```

❌ **DON'T**: Mock internal logic
```typescript
// Don't mock the service you're testing!
const mockUsersService = {
  findAll: jest.fn().mockReturnValue([]),
};
```

### 6. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle decimals', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2);
  });
});
```

---

## 🔄 CI/CD Integration

Tests run automatically in CI/CD:

### GitHub Actions

```yaml
# .github/workflows/backend-ci.yml
- name: Run unit tests
  run: pnpm run test

- name: Run E2E tests
  run: pnpm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
```

### Local Pre-commit Hook

```bash
# .husky/pre-commit
pnpm run test  # Runs before every commit
```

### Code Coverage Requirements

- Unit tests: 80% minimum
- E2E tests: Run all critical paths
- Coverage report generated on every push

---

## 🎯 Testing Checklist

### For Every Feature

- [ ] Write unit tests for services
- [ ] Write unit tests for controllers
- [ ] Write E2E tests for API endpoints
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Test authentication/authorization
- [ ] Achieve 80%+ code coverage
- [ ] All tests pass locally
- [ ] All tests pass in CI

### Before Merging PR

- [ ] All new code has tests
- [ ] All tests pass
- [ ] Coverage meets threshold
- [ ] No console.log statements
- [ ] Test names are descriptive
- [ ] Tests are independent

---

## 📊 Test Coverage

### View Coverage

```bash
# Generate and open coverage report
pnpm run test:cov
open coverage/lcov-report/index.html
```

### Coverage Badges

Add to README:
```markdown
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

---

## 🔍 Debugging Tests

### VSCode Debugging

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Specific Test

```bash
# Run specific test with debugging
pnpm run test:debug users.service.spec.ts

# Then open chrome://inspect
```

### Increase Timeout for Debugging

```typescript
jest.setTimeout(60000); // 60 seconds for debugging
```

---

**Status**: ✅ Testing infrastructure ready!

**Next Steps**: Write tests as you develop features.
