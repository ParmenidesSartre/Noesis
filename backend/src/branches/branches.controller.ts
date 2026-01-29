import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  create(@Body() createBranchDto: CreateBranchDto, @CurrentUser() user: CurrentUserData) {
    return this.branchesService.create({
      ...createBranchDto,
      organizationId: user.organizationId,
    });
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.branchesService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.branchesService.findOne(+id, user.organizationId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @CurrentUser() user: CurrentUserData) {
    return this.branchesService.update(+id, updateBranchDto, user.organizationId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.branchesService.remove(+id, user.organizationId);
  }
}
