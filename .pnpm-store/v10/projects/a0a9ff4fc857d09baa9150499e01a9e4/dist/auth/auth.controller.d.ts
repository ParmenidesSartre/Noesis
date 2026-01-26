import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerTenantDto: RegisterTenantDto): Promise<{
        organization: {
            name: string;
            slug: string;
            email: string;
            phone: string | null;
            address: string | null;
            plan: import("@prisma/client").$Enums.SubscriptionPlan;
            planStatus: import("@prisma/client").$Enums.PlanStatus;
            trialEndsAt: Date | null;
            country: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        };
        adminUser: {
            name: string;
            email: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            role: import("@prisma/client").$Enums.Role;
            organizationId: number;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            organizationId: number;
            isActive: true;
        };
        organization: {
            name: string;
            slug: string;
            planStatus: import("@prisma/client").$Enums.PlanStatus;
            isActive: boolean;
            id: number;
        };
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
