import { ConfigService } from '../services/config.service';
import { ConfigCreateDto, ConfigUpdateDto } from '../dto/config.dto';
export declare class ConfigController {
    private readonly service;
    constructor(service: ConfigService);
    save(dto: ConfigCreateDto, request: any): Promise<import("../entities").LowcodeConfig>;
    getMyConfig(request: any): Promise<import("../entities").LowcodeConfig | null>;
    findAll(): Promise<import("../entities").LowcodeConfig[]>;
    detail(id: string): Promise<import("../entities").LowcodeConfig | null>;
    update(dto: ConfigUpdateDto, request: any): Promise<[affectedCount: number]>;
    delete(id: string): Promise<boolean>;
    deleteMyConfig(request: any): Promise<boolean>;
}
