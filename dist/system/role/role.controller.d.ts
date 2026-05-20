import { RoleService } from './role.service';
import { RoleCreateDto, RolePageListDto, RoleUpdateDto } from './dto/create-role.dto';
export declare class RoleController {
    private readonly service;
    constructor(service: RoleService);
    create(dto: RoleCreateDto): Promise<import("./entities/role.entity").Role>;
    update(dto: RoleUpdateDto): Promise<import("./entities/role.entity").Role>;
    list(dto: RolePageListDto): Promise<{
        list: import("./entities/role.entity").Role[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<any>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/role.entity").Role[]>;
}
