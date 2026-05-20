import { StaffCreateDto, StaffPageListDto, StaffUpdateDto } from './dto/create-staff.dto';
import { Staff } from './entities/staff.entity';
export declare class StaffService {
    private model;
    constructor(model: typeof Staff);
    create(dto: StaffCreateDto): Promise<Staff>;
    findPageList(dto: StaffPageListDto): Promise<{
        list: Staff[];
        total: number;
    }>;
    findAll(): Promise<Staff[]>;
    findOne(id: string): Promise<StaffUpdateDto>;
    update(dto: StaffUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<number>;
}
