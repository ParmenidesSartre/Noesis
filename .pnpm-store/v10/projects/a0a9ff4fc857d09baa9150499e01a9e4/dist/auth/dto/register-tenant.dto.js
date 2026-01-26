"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterTenantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class RegisterTenantDto {
    organizationName;
    organizationSlug;
    organizationEmail;
    organizationPhone;
    organizationAddress;
    organizationCountry;
    plan;
    adminName;
    adminEmail;
    adminPassword;
}
exports.RegisterTenantDto = RegisterTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ABC Tuition Centre',
        description: 'Organization name displayed in the platform',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'abc-tuition-centre',
        description: 'Optional slug/subdomain. If omitted, a slug is generated from the name.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'organizationSlug must contain only lowercase letters, numbers, and hyphens',
    }),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationSlug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'hello@abctuition.com',
        description: 'Primary organization contact email',
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+65 1234 5678',
        description: 'Organization phone number',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123 Main St, Singapore',
        description: 'Organization address (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Singapore',
        description: 'Organization country (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "organizationCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.SubscriptionPlan,
        description: 'Subscription plan. Defaults to FREE_TRIAL.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionPlan),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Alice Admin',
        description: 'Name of the initial admin user',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "adminName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'admin@abctuition.com',
        description: 'Email of the initial admin user',
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "adminEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Str0ngP@ssword!',
        description: 'Password for the initial admin user (min 8 chars, with upper, lower, number, symbol)',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
        message: 'adminPassword must include upper and lower case letters, numbers, and special characters',
    }),
    __metadata("design:type", String)
], RegisterTenantDto.prototype, "adminPassword", void 0);
//# sourceMappingURL=register-tenant.dto.js.map