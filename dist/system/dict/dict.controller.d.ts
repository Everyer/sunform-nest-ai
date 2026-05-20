import { DictService } from './dict.service';
import { DictCreateDto, DictPageListDto, DictUpdateDto } from './dto/create-dict.dto';
export declare class DictController {
    private readonly service;
    constructor(service: DictService);
    create(dto: DictCreateDto): Promise<import("./entities/dict.entity").Dict>;
    update(dto: DictUpdateDto): Promise<[affectedCount: number]>;
    list(dto: DictPageListDto): Promise<{
        list: import("./entities/dict.entity").Dict[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/dict.entity").Dict | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/dict.entity").Dict[]>;
    findTree(): Promise<any[]>;
    findListByCode(dto: {
        code: string;
    }): Promise<any[]>;
}
