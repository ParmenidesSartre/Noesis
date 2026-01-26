import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(createBranchDto: CreateBranchDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateBranchDto: UpdateBranchDto): string;
    remove(id: string): string;
}
