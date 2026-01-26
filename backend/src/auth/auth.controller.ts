import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new tenant organization',
    description: 'Creates an organization and the initial SUPER_ADMIN user with a 14-day trial.',
  })
  @ApiResponse({ status: 201, description: 'Organization registered' })
  @ApiResponse({
    status: 409,
    description: 'Organization email or slug already exists',
  })
  register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.authService.register(registerTenantDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login with organization slug and credentials',
    description: 'Authenticates a user and returns a JWT containing organization context.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout current user',
    description:
      'Stateless logout acknowledgement. Token invalidation/blacklist can be added later.',
  })
  @ApiResponse({ status: 200, description: 'Logout acknowledged' })
  logout() {
    return this.authService.logout();
  }
}
