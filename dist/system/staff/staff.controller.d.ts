import { StaffService } from './staff.service';
import { StaffCreateDto, StaffPageListDto, StaffUpdateDto } from './dto/create-staff.dto';
export declare class StaffController {
    private readonly service;
    constructor(service: StaffService);
    create(dto: StaffCreateDto): Promise<import("./entities/staff.entity").Staff>;
    update(dto: StaffUpdateDto): Promise<[affectedCount: number]>;
    list(dto: StaffPageListDto): Promise<{
        list: import("./entities/staff.entity").Staff[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<StaffUpdateDto>;
    delete(dto: {
        id: string;
    }): Promise<number>;
    findAll(): Promise<import("./entities/staff.entity").Staff[]>;
}
