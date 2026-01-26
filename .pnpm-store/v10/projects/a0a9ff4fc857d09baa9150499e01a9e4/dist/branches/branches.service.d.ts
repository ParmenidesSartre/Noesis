import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchesService {
    create(createBranchDto: CreateBranchDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBranchDto: UpdateBranchDto): string;
    remove(id: number): string;
}
