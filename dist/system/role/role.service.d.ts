import { RoleCreateDto, RolePageListDto, RoleUpdateDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
export declare class RoleService {
    private model;
    constructor(model: typeof Role);
    create(CreateDto: RoleCreateDto): Promise<Role>;
    findPageList(dto: RolePageListDto): Promise<{
        list: Role[];
        total: number;
    }>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<any>;
    update(dto: RoleUpdateDto): Promise<Role>;
    remove(id: string): Promise<boolean>;
}
