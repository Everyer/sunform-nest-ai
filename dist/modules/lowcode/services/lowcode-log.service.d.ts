import { LowcodeLogCreateDto, LowcodeLogPageListDto, LowcodeLogUpdateRemarkDto } from '../dto/lowcode-log.dto';
import { LowcodeLog } from '../entities/lowcode-log.entity';
import { User } from '../../../system/user/entities/user.entity';
export declare class LowcodeLogService {
    private model;
    constructor(model: typeof LowcodeLog);
    create(createDto: LowcodeLogCreateDto): Promise<LowcodeLog>;
    findPageList(dto: LowcodeLogPageListDto): Promise<{
        list: LowcodeLog[];
        total: number;
    }>;
    findPageListByCode(componentCode: string, pageindex?: number, pagesize?: number): Promise<{
        list: LowcodeLog[];
        total: number;
    }>;
    findAll(): Promise<LowcodeLog[]>;
    findByCode(componentCode: string): Promise<LowcodeLog[]>;
    findOne(id: string): Promise<LowcodeLog | null>;
    updateRemark(dto: LowcodeLogUpdateRemarkDto): Promise<boolean>;
    remove(id: string, user: User): Promise<boolean>;
}
