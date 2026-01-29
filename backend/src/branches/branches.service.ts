import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    const { organizationId, ...branchData } = createBranchDto;

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    return this.prisma.branch.create({
      data: {
        ...branchData,
        organizationId,
      },
    });
  }

  async findAll(organizationId: number) {
    return this.prisma.branch.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, organizationId: number) {
    return this.prisma.branch.findFirst({
      where: { id, organizationId },
    });
  }

  async update(id: number, updateBranchDto: UpdateBranchDto, organizationId: number) {
    return this.prisma.branch.update({
      where: { id, organizationId },
      data: updateBranchDto,
    });
  }

  async remove(id: number, organizationId: number) {
    return this.prisma.branch.delete({
      where: { id, organizationId },
    });
  }
}
