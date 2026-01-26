import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: number;
  email: string;
  name: string;
  role: string;
  organizationId: number;
  organizationSlug: string;
  branchId: number | null;
  branch: {
    id: number;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUserData }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
