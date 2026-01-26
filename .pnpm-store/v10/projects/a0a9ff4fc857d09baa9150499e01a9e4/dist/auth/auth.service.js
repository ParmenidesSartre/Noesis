"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const logger_service_1 = require("../common/logger/logger.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    logger;
    jwtService;
    constructor(prisma, logger, jwtService) {
        this.prisma = prisma;
        this.logger = logger;
        this.jwtService = jwtService;
        this.logger.setContext(AuthService_1.name);
    }
    async register(dto) {
        const normalizedSlug = this.slugify(dto.organizationSlug || dto.organizationName);
        const existingOrg = await this.prisma.organization.findUnique({
            where: { email: dto.organizationEmail },
            select: { id: true, email: true },
        });
        if (existingOrg) {
            throw new common_1.ConflictException('Organization already exists with this email');
        }
        const slug = await this.resolveSlug(normalizedSlug, Boolean(dto.organizationSlug));
        const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
        const trialEndsAt = this.calculateTrialEndDate();
        const result = await this.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: dto.organizationName,
                    email: dto.organizationEmail,
                    phone: dto.organizationPhone,
                    address: dto.organizationAddress,
                    country: dto.organizationCountry,
                    slug,
                    plan: dto.plan || client_1.SubscriptionPlan.FREE_TRIAL,
                    planStatus: client_1.PlanStatus.TRIAL,
                    trialEndsAt,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    country: true,
                    slug: true,
                    plan: true,
                    planStatus: true,
                    trialEndsAt: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const adminUser = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    name: dto.adminName,
                    role: client_1.Role.SUPER_ADMIN,
                    organizationId: organization.id,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    organizationId: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return { organization, adminUser };
        });
        this.logger.log(`New organization registered: ${result.organization.slug} (${result.organization.id})`);
        return result;
    }
    slugify(value) {
        const normalized = value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-');
        if (!normalized) {
            throw new common_1.BadRequestException('Invalid organization name or slug');
        }
        return normalized;
    }
    async resolveSlug(baseSlug, userProvided) {
        const existing = await this.prisma.organization.findUnique({
            where: { slug: baseSlug },
            select: { id: true },
        });
        if (!existing) {
            return baseSlug;
        }
        if (userProvided) {
            throw new common_1.ConflictException('Organization slug already in use');
        }
        let counter = 2;
        let candidate = `${baseSlug}-${counter}`;
        while (await this.prisma.organization.findUnique({
            where: { slug: candidate },
            select: { id: true },
        })) {
            counter += 1;
            candidate = `${baseSlug}-${counter}`;
        }
        return candidate;
    }
    calculateTrialEndDate() {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        return trialEnd;
    }
    async login(dto) {
        const organization = await this.prisma.organization.findUnique({
            where: { slug: dto.organizationSlug },
            select: {
                id: true,
                slug: true,
                name: true,
                planStatus: true,
                isActive: true,
            },
        });
        if (!organization || !organization.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                organizationId: organization.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                isActive: true,
                organizationId: true,
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            organizationId: organization.id,
            organizationSlug: organization.slug,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        this.logger.log(`User ${user.email} logged in for organization ${organization.slug}`);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
                isActive: user.isActive,
            },
            organization,
        };
    }
    async logout() {
        return { message: 'Logged out' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.LoggerService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map