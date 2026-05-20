import { ConfigCreateDto, ConfigUpdateDto } from '../dto/config.dto';
import { LowcodeConfig } from '../entities/config.entity';
export declare class ConfigService {
    private model;
    constructor(model: typeof LowcodeConfig);
    createOrUpdate(createDto: ConfigCreateDto, userid: string): Promise<LowcodeConfig>;
    findByUserId(userid: string): Promise<LowcodeConfig | null>;
    findAll(): Promise<LowcodeConfig[]>;
    findOne(id: string): Promise<LowcodeConfig | null>;
    update(dto: ConfigUpdateDto, userid: string): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
    removeByUserId(userid: string): Promise<boolean>;
}
