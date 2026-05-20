import { DepartmentCreateDto, DepartmentPageListDto, DepartmentUpdateDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';
export declare class DepartmentService {
    private model;
    constructor(model: typeof Department);
    create(CreateDto: DepartmentCreateDto): Promise<Department>;
    findPageList(dto: DepartmentPageListDto): Promise<{
        list: Department[];
        total: number;
    }>;
    findAll(): Promise<Department[]>;
    findTree(): Promise<any[]>;
    findOne(id: string): Promise<Department | null>;
    update(dto: DepartmentUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
