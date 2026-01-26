# Backend Coding Standards

**Project**: Tuition Centre Management System - Backend
**Framework**: NestJS + Prisma + TypeScript
**Last Updated**: 2026-01-26

---

## 📋 Table of Contents

1. [File Naming Conventions](#file-naming-conventions)
2. [Folder Structure](#folder-structure)
3. [Naming Conventions](#naming-conventions)
4. [Module Structure](#module-structure)
5. [DTOs and Validation](#dtos-and-validation)
6. [Services and Business Logic](#services-and-business-logic)
7. [Controllers and Routes](#controllers-and-routes)
8. [Error Handling](#error-handling)
9. [API Response Format](#api-response-format)
10. [Database Conventions](#database-conventions)
11. [Authentication and Authorization](#authentication-and-authorization)
12. [Testing Standards](#testing-standards)
13. [Code Documentation](#code-documentation)
14. [TypeScript Best Practices](#typescript-best-practices)
15. [Git Commit Conventions](#git-commit-conventions)

---

## 1. File Naming Conventions

### General Rules
- Use **kebab-case** for all file names
- Use descriptive names that indicate the file's purpose
- Use appropriate suffixes for file types

### File Suffixes
```
✅ DO
users.controller.ts        # Controller
users.service.ts            # Service
users.module.ts             # Module
create-user.dto.ts          # DTO
user.entity.ts              # Entity/Model
users.controller.spec.ts    # Unit test
users.e2e-spec.ts          # E2E test
jwt.strategy.ts             # Strategy
roles.guard.ts              # Guard
roles.decorator.ts          # Decorator
user.interface.ts           # Interface
auth.constants.ts           # Constants
users.repository.ts         # Repository (if used)

❌ DON'T
UsersController.ts          # PascalCase file name
users_controller.ts         # snake_case
usercontroller.ts           # No suffix
```

---

## 2. Folder Structure

### Standard Module Structure
```
src/
├── common/                      # Shared utilities
│   ├── decorators/             # Custom decorators
│   ├── guards/                 # Auth guards
│   ├── interceptors/           # Custom interceptors
│   ├── filters/                # Exception filters
│   ├── pipes/                  # Validation pipes
│   └── interfaces/             # Shared interfaces
│
├── config/                      # Configuration files
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
│
├── prisma/                      # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── auth/                        # Auth module
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── refresh-token.dto.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── auth.controller.spec.ts
│
├── users/                       # Users module (example)
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── users.controller.spec.ts
│
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

### Module Organization Rules
- Each feature should have its own module folder
- Keep related files together in the same module
- Use subfolders for `dto/`, `entities/`, `strategies/`, `guards/` when needed
- Never mix concerns between modules

---

## 3. Naming Conventions

### Classes
```typescript
✅ DO - PascalCase
export class UsersController {}
export class UsersService {}
export class CreateUserDto {}
export class JwtAuthGuard {}
export class RolesGuard {}

❌ DON'T
export class usersController {}      // camelCase
export class users_service {}        // snake_case
export class USERS_MODULE {}         // UPPER_CASE
```

### Interfaces and Types
```typescript
✅ DO - PascalCase with 'I' prefix for interfaces (optional but consistent)
export interface IUser {}
export interface IAuthPayload {}
export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'TEACHER';
export type PaginationOptions = { page: number; limit: number };

✅ ALSO ACCEPTABLE - Without 'I' prefix
export interface User {}
export interface AuthPayload {}
```

### Variables and Functions
```typescript
✅ DO - camelCase
const userId = 1;
const isActive = true;
const getUserById = (id: number) => {};
async function createUser(dto: CreateUserDto) {}

❌ DON'T
const UserId = 1;                    // PascalCase
const user_id = 1;                   // snake_case
const USERID = 1;                    // UPPER_CASE
```

### Constants
```typescript
✅ DO - UPPER_SNAKE_CASE for true constants
export const JWT_SECRET = 'secret';
export const MAX_LOGIN_ATTEMPTS = 5;
export const API_VERSION = 'v1';

✅ DO - camelCase for configuration objects
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1d',
};
```

### Enums
```typescript
✅ DO - PascalCase for enum name, UPPER_CASE for values
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}
```

---

## 4. Module Structure

### Module Template
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// Import other dependencies

@Module({
  imports: [
    // Other modules this module depends on
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export if other modules need it
})
export class UsersModule {}
```

### Rules
- One module per feature
- Import PrismaModule is automatic (it's global)
- Export services that other modules need
- Keep modules focused and cohesive

---

## 5. DTOs and Validation

### DTO Structure
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd',
    description: 'User password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: Role,
    example: Role.TEACHER,
    description: 'User role',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
```

### Update DTOs
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Use PartialType to make all fields optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Response DTOs
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  role: string;

  @Exclude() // Never expose password
  password: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
```

### DTO Rules
1. **Always use class-validator** decorators for validation
2. **Always use @ApiProperty** for Swagger documentation
3. **Never expose sensitive data** (passwords, secrets) in response DTOs
4. **Use PartialType** for update DTOs
5. **Use Exclude/Expose** for response transformation
6. **Provide examples** in @ApiProperty for better documentation

---

## 6. Services and Business Logic

### Service Template
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns Created user without password
   * @throws ConflictException if email already exists
   */
  async create(createUserDto: CreateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  /**
   * Find all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Paginated list of users
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User without password
   * @throws NotFoundException if user not found
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   * @throws NotFoundException if user not found
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Throws if not found

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user by ID (soft delete - set isActive to false)
   * @param id - User ID
   * @throws NotFoundException if user not found
   */
  async remove(id: number) {
    await this.findOne(id); // Throws if not found

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deleted successfully' };
  }
}
```

### Service Rules
1. **Single Responsibility**: Each service should handle one domain
2. **Inject PrismaService**: Use constructor injection
3. **JSDoc Comments**: Document all public methods
4. **Error Handling**: Throw appropriate NestJS exceptions
5. **Never return passwords**: Always exclude sensitive data
6. **Use select**: Explicitly select fields to avoid over-fetching
7. **Use transactions**: For operations that modify multiple tables
8. **Validate business logic**: Not just data validation

### Transaction Example
```typescript
async createStudentWithParent(data: CreateStudentWithParentDto) {
  return await this.prisma.$transaction(async (tx) => {
    // Create parent user
    const parentUser = await tx.user.create({
      data: {
        email: data.parentEmail,
        password: hashedPassword,
        name: data.parentName,
        role: Role.PARENT,
      },
    });

    // Create parent profile
    const parent = await tx.parent.create({
      data: {
        userId: parentUser.id,
        occupation: data.parentOccupation,
      },
    });

    // Create student user
    const studentUser = await tx.user.create({
      data: {
        email: data.studentEmail,
        password: hashedPassword,
        name: data.studentName,
        role: Role.STUDENT,
        branchId: data.branchId,
      },
    });

    // Create student profile
    const student = await tx.student.create({
      data: {
        userId: studentUser.id,
        branchId: data.branchId,
        studentCode: data.studentCode,
        grade: data.grade,
      },
    });

    // Link parent to student
    await tx.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        relationship: 'Parent',
        isPrimary: true,
      },
    });

    return { student, parent };
  });
}
```

---

## 7. Controllers and Routes

### Controller Template
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

### Controller Rules
1. **Use @ApiTags** for grouping in Swagger
2. **Document all endpoints** with @ApiOperation and @ApiResponse
3. **Use Guards** for authentication and authorization
4. **Use ParseIntPipe** for numeric parameters
5. **Keep controllers thin**: Delegate logic to services
6. **Use decorators** for common patterns (auth, roles, pagination)
7. **RESTful routes**: Follow REST conventions

### Route Naming
```
✅ DO - RESTful conventions
GET    /api/v1/users              # List all
GET    /api/v1/users/:id          # Get one
POST   /api/v1/users              # Create
PATCH  /api/v1/users/:id          # Update (partial)
PUT    /api/v1/users/:id          # Update (full)
DELETE /api/v1/users/:id          # Delete

GET    /api/v1/users/:id/profile  # Nested resource
POST   /api/v1/users/:id/activate # Action

❌ DON'T
GET    /api/v1/getUsers
POST   /api/v1/createUser
GET    /api/v1/user/:id/get
DELETE /api/v1/removeUser/:id
```

---

## 8. Error Handling

### Standard Exceptions
```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

// Use built-in NestJS exceptions
✅ DO
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid input data');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Insufficient permissions');

❌ DON'T
throw new Error('User not found');
return { error: 'User not found' };
```

### Custom Exception Filter (if needed)
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 9. API Response Format

### Success Response
```typescript
// Single item
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "TEACHER",
  "createdAt": "2026-01-26T10:00:00.000Z"
}

// List with pagination
{
  "data": [
    { "id": 1, "email": "user1@example.com", "name": "User 1" },
    { "id": 2, "email": "user2@example.com", "name": "User 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Action response
{
  "message": "User deleted successfully"
}
```

### Error Response
```typescript
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found",
  "timestamp": "2026-01-26T10:00:00.000Z",
  "path": "/api/v1/users/999"
}
```

---

## 10. Database Conventions

### Prisma Model Naming
```prisma
✅ DO - Singular, PascalCase
model User {}
model Student {}
model ParentStudent {}  // Junction table

❌ DON'T
model Users {}          // Plural
model user {}           // lowercase
```

### Table Naming (with @@map)
```prisma
✅ DO - Plural, snake_case
model User {
  @@map("users")
}

model ParentStudent {
  @@map("parent_student")
}
```

### Field Naming
```prisma
✅ DO - camelCase in model, snake_case in database
model User {
  id        Int      @id @default(autoincrement())
  firstName String   @map("first_name")
  createdAt DateTime @default(now()) @map("created_at")
}
```

### Indexes
```prisma
✅ DO - Add indexes for foreign keys and frequently queried fields
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  branchId Int?

  @@index([email])
  @@index([branchId])
}
```

### Relations
```prisma
✅ DO - Use descriptive relation names
model User {
  id       Int      @id @default(autoincrement())

  // One-to-one
  teacher  Teacher?
  student  Student?

  // Many-to-one
  branch   Branch?  @relation(fields: [branchId], references: [id])
  branchId Int?
}

model Branch {
  id    Int    @id @default(autoincrement())

  // One-to-many
  users User[]
}
```

---

## 11. Authentication and Authorization

### JWT Payload
```typescript
export interface JwtPayload {
  sub: number;        // User ID
  email: string;
  role: Role;
  branchId?: number;
  iat?: number;
  exp?: number;
}
```

### Custom Decorator
```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage in controller
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) {
  return this.usersService.findOne(user.sub);
}
```

### Roles Guard
```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

---

## 12. Testing Standards

### Unit Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.TEACHER,
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        password: 'hashed_password',
        phone: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.TEACHER,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({} as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.TEACHER,
        phone: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Test Rules
1. **Test file naming**: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for E2E
2. **One describe block per method**
3. **Test both success and error cases**
4. **Mock external dependencies** (PrismaService, etc.)
5. **Use meaningful test descriptions**
6. **Aim for 80%+ code coverage**

---

## 13. Code Documentation

### JSDoc for Public Methods
```typescript
/**
 * Create a new user in the system
 *
 * @param createUserDto - User creation data including email, password, name, and role
 * @returns The created user object without the password field
 * @throws {ConflictException} If a user with the given email already exists
 * @throws {BadRequestException} If the input data is invalid
 *
 * @example
 * ```typescript
 * const user = await usersService.create({
 *   email: 'john@example.com',
 *   password: 'SecureP@ss123',
 *   name: 'John Doe',
 *   role: Role.TEACHER
 * });
 * ```
 */
async create(createUserDto: CreateUserDto) {
  // Implementation
}
```

### Inline Comments
```typescript
✅ DO - Explain WHY, not WHAT
// Check if user exists to prevent duplicate emails
const existingUser = await this.prisma.user.findUnique({
  where: { email: createUserDto.email },
});

// Hash password with bcrypt using 10 salt rounds for security
const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

❌ DON'T - State the obvious
// Find user by email
const existingUser = await this.prisma.user.findUnique({
  where: { email: createUserDto.email },
});

// Hash the password
const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
```

---

## 14. TypeScript Best Practices

### Type Safety
```typescript
✅ DO - Explicit types
function createUser(dto: CreateUserDto): Promise<User> {
  return this.prisma.user.create({ data: dto });
}

const userId: number = 1;
const role: Role = Role.TEACHER;

❌ DON'T - Use 'any'
function createUser(dto: any): any {
  return this.prisma.user.create({ data: dto });
}

const userId: any = 1;
```

### Use Type Inference When Obvious
```typescript
✅ DO
const user = await this.prisma.user.findUnique({ where: { id: 1 } });
const count = users.length;
const isActive = true;

❌ DON'T - Redundant type annotations
const user: User = await this.prisma.user.findUnique({ where: { id: 1 } });
const count: number = users.length;
const isActive: boolean = true;
```

### Use Enums from Prisma
```typescript
✅ DO - Import enums from @prisma/client
import { Role, PaymentStatus } from '@prisma/client';

const userRole: Role = Role.TEACHER;

❌ DON'T - Redefine enums
enum Role {
  TEACHER = 'TEACHER',
}
```

### Async/Await
```typescript
✅ DO - Use async/await
async function getUser(id: number) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  return user;
}

❌ DON'T - Use .then() chains
function getUser(id: number) {
  return this.prisma.user.findUnique({ where: { id } }).then(user => user);
}
```

---

## 15. Git Commit Conventions

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **perf**: Performance improvements

### Examples
```bash
✅ GOOD COMMITS
feat(auth): add JWT authentication with refresh tokens
fix(users): resolve duplicate email validation issue
docs(api): update Swagger documentation for users endpoint
refactor(services): extract common pagination logic
test(auth): add unit tests for login service
chore(deps): update NestJS to version 11.0

❌ BAD COMMITS
Added stuff
Fixed bug
WIP
update
asdfasdf
```

### Commit Rules
1. Use **imperative mood**: "add" not "added" or "adds"
2. **Don't capitalize** the first letter
3. **No period** at the end
4. Keep subject line **under 50 characters**
5. Separate subject from body with a blank line
6. Wrap body at **72 characters**

---

## 📋 Quick Reference Checklist

Before committing code, ensure:

- [ ] File names use kebab-case
- [ ] Classes use PascalCase
- [ ] Variables/functions use camelCase
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] DTOs have validation decorators
- [ ] DTOs have Swagger decorators (@ApiProperty)
- [ ] Controllers have @ApiTags and @ApiOperation
- [ ] Services have JSDoc comments
- [ ] No passwords in responses
- [ ] Appropriate exceptions thrown
- [ ] Guards applied for protected routes
- [ ] Tests written for new features
- [ ] Types are explicit (no 'any')
- [ ] Prisma queries use 'select' to avoid over-fetching
- [ ] Meaningful commit message

---

## 🔄 Continuous Improvement

This document is a living standard. As the project evolves:
- Update conventions based on team feedback
- Add new patterns as they emerge
- Remove outdated practices
- Keep examples up to date

**Last Review**: 2026-01-26
**Next Review**: After Phase 0 completion

---

**Questions or suggestions?** Discuss with the team and update this document accordingly.
