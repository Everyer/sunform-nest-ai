import { DepartmentService } from './department.service';
import { DepartmentCreateDto, DepartmentPageListDto, DepartmentUpdateDto } from './dto/create-department.dto';
export declare class DepartmentController {
    private readonly service;
    constructor(service: DepartmentService);
    create(dto: DepartmentCreateDto): Promise<import("./entities/department.entity").Department>;
    update(dto: DepartmentUpdateDto): Promise<[affectedCount: number]>;
    list(dto: DepartmentPageListDto): Promise<{
        list: import("./entities/department.entity").Department[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/department.entity").Department | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/department.entity").Department[]>;
    findTree(): Promise<any[]>;
}
