/**
 * Unit Tests for UsersService
 *
 * Tests the business logic of the UsersService
 * Uses mocked PrismaService to isolate tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let _prismaService: PrismaService;

  // Mock Prisma client
  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    read: jest.fn(),
    write: jest.fn(),
    getReadClient: jest.fn(),
    getWriteClient: jest.fn(),
  };

  // Mock Logger
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    setContext: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'STUDENT',
          isActive: true,
        },
      ];

      mockPrismaService.read.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              findMany: jest.fn().mockResolvedValue(mockUsers),
            },
          }),
        ),
      );

      const result = service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.read).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', () => {
      mockPrismaService.read.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          }),
        ),
      );

      const result = service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT',
      };

      mockPrismaService.read.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
            },
          }),
        ),
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.read.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          }),
        ),
      );

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        role: 'STUDENT' as const,
      };

      const mockCreatedUser = {
        id: 1,
        ...createUserDto,
        password: 'hashed_password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.write.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              create: jest.fn().mockResolvedValue(mockCreatedUser),
            },
          }),
        ),
      );

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrismaService.write).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'User',
        role: 'STUDENT' as const,
      };

      mockPrismaService.write.mockImplementation(() => {
        throw Object.assign(new Error('Unique constraint failed'), {
          code: 'P2002',
          meta: { target: ['email'] },
        });
      });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'STUDENT',
      };

      mockPrismaService.write.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              update: jest.fn().mockResolvedValue(mockUpdatedUser),
            },
          }),
        ),
      );

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.write.mockImplementation(() => {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      });

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockDeletedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.write.mockImplementation((callback) =>
        Promise.resolve(
          callback({
            user: {
              delete: jest.fn().mockResolvedValue(mockDeletedUser),
            },
          }),
        ),
      );

      const result = await service.remove(1);

      expect(result).toEqual(mockDeletedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.write.mockImplementation(() => {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
