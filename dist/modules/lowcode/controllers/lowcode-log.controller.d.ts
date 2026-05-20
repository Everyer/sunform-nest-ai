import { LowcodeLogService } from '../services/lowcode-log.service';
import { LowcodeLogCreateDto, LowcodeLogPageListDto, LowcodeLogByCodeDto, LowcodeLogPageByCodeDto, LowcodeLogUpdateRemarkDto } from '../dto/lowcode-log.dto';
export declare class LowcodeLogController {
    private readonly service;
    constructor(service: LowcodeLogService);
    create(dto: LowcodeLogCreateDto): Promise<import("../entities").LowcodeLog>;
    list(dto: LowcodeLogPageListDto): Promise<{
        list: import("../entities").LowcodeLog[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("../entities").LowcodeLog | null>;
    delete(dto: {
        id: string;
    }, request: any): Promise<boolean>;
    findAll(): Promise<import("../entities").LowcodeLog[]>;
    findByCode(dto: LowcodeLogByCodeDto): Promise<import("../entities").LowcodeLog[]>;
    findPageByCode(dto: LowcodeLogPageByCodeDto): Promise<{
        list: import("../entities").LowcodeLog[];
        total: number;
    }>;
    updateRemark(dto: LowcodeLogUpdateRemarkDto): Promise<boolean>;
}
