import { SubscriptionPlan } from '@prisma/client';
export declare class RegisterTenantDto {
    organizationName: string;
    organizationSlug?: string;
    organizationEmail: string;
    organizationPhone?: string;
    organizationAddress?: string;
    organizationCountry?: string;
    plan?: SubscriptionPlan;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}
