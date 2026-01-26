# Backend Coding Standards - Quick Reference

**Full Documentation**: See [CODING_STANDARDS.md](./CODING_STANDARDS.md)

---

## 📁 File Naming

```
users.controller.ts       ✅
users.service.ts          ✅
create-user.dto.ts        ✅
UsersController.ts        ❌
users_service.ts          ❌
```

**Rule**: kebab-case with appropriate suffix

---

## 🏗️ Class Naming

```typescript
export class UsersController {}     ✅
export class UsersService {}        ✅
export class CreateUserDto {}       ✅
export class usersController {}     ❌
```

**Rule**: PascalCase

---

## 📝 Variables & Functions

```typescript
const userId = 1;                           ✅
const isActive = true;                      ✅
async function createUser(dto) {}           ✅
const UserId = 1;                           ❌
const user_id = 1;                          ❌
```

**Rule**: camelCase

---

## 🔢 Constants

```typescript
const JWT_SECRET = 'secret';                ✅
const MAX_LOGIN_ATTEMPTS = 5;               ✅
const jwtConfig = { secret: '...' };        ✅
const jwt_secret = 'secret';                ❌
```

**Rule**: UPPER_SNAKE_CASE for constants, camelCase for config objects

---

## 📦 DTO Template

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ss', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

**Must have**: Validation decorators + Swagger decorators

---

## 🛡️ Service Template

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   * @param dto - User data
   * @throws ConflictException if email exists
   */
  async create(dto: CreateUserDto) {
    // Check existence
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const password = await bcrypt.hash(dto.password, 10);

    // Create
    const user = await this.prisma.user.create({
      data: { ...dto, password },
    });

    // Remove sensitive data
    const { password: _, ...result } = user;
    return result;
  }
}
```

**Must have**: JSDoc, error handling, no passwords in response

---

## 🎮 Controller Template

```typescript
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
```

**Must have**: Swagger docs, Guards, ParseIntPipe for IDs

---

## ⚠️ Error Handling

```typescript
// ✅ Use NestJS exceptions
throw new NotFoundException('User not found');
throw new ConflictException('Email exists');
throw new BadRequestException('Invalid data');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('No permission');

// ❌ Don't use generic Error
throw new Error('User not found');
```

---

## 🗄️ Prisma Best Practices

```typescript
// ✅ Always use 'select' to avoid over-fetching
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // password: false (excluded)
  },
});

// ✅ Use transactions for multi-table operations
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ data: profileData });
  return { user, profile };
});

// ❌ Don't fetch everything
const user = await prisma.user.findUnique({ where: { id } });
```

---

## 🔐 Never Expose Passwords

```typescript
// ✅ Method 1: Destructuring
const { password, ...result } = user;
return result;

// ✅ Method 2: Select specific fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // Exclude password
  },
});

// ❌ Don't return raw user object
return user; // Contains password!
```

---

## 📊 Pagination Pattern

```typescript
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.user.findMany({ skip, take: limit }),
    this.prisma.user.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 🧪 Test Template

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});
```

---

## 📝 Git Commits

```bash
# ✅ Good commits
feat(auth): add JWT authentication
fix(users): resolve email validation bug
docs(api): update Swagger documentation
test(auth): add login service tests

# ❌ Bad commits
Added stuff
Fixed bug
WIP
update
```

**Format**: `<type>(<scope>): <description>`

---

## ✅ Pre-Commit Checklist

Before committing, ensure:

- [ ] File names use kebab-case
- [ ] Classes use PascalCase
- [ ] DTOs have validation + Swagger decorators
- [ ] Services have JSDoc comments
- [ ] No passwords in responses
- [ ] Controllers have API documentation
- [ ] Appropriate exceptions used
- [ ] Tests written
- [ ] No 'any' types
- [ ] Meaningful commit message

---

**Full details**: [CODING_STANDARDS.md](./CODING_STANDARDS.md)
