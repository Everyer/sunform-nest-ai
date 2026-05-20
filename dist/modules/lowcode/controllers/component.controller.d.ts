import { ComponentService } from '../services/component.service';
import { ComponentCreateDto, ComponentPageListDto, ComponentUpdateDto, GetConfigByOtherProjectDto, UpdateOperatorsDto } from '../dto/component.dto';
export declare class ComponentController {
    private readonly service;
    constructor(service: ComponentService);
    create(dto: ComponentCreateDto): Promise<import("../entities").Component>;
    update(dto: ComponentUpdateDto, request: any): Promise<[affectedCount: number]>;
    list(dto: ComponentPageListDto): Promise<{
        list: import("../entities").Component[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("../entities").Component | null>;
    detailById(dto: {
        id: string;
    }): Promise<object>;
    detailByComponentCode(dto: {
        componentCode: string;
    }): Promise<object>;
    delete(dto: {
        id: string;
    }, request: any): Promise<boolean>;
    findAll(): Promise<import("../entities").Component[]>;
    findByPageId(dto: {
        pageId: string;
    }): Promise<import("../entities").Component[]>;
    findByProjectId(dto: {
        projectId: string;
    }): Promise<import("../entities").Component[]>;
    getComponentTypeOptions(): Promise<{
        code: number;
        message: string;
        success: boolean;
        data: {
            label: string;
            value: import("../constants/component.constants").ComponentType;
        }[];
    }>;
    getConfigByOtherProject(dto: GetConfigByOtherProjectDto): Promise<import("../entities").Component>;
    updateOperators(dto: UpdateOperatorsDto, request: any): Promise<{
        code: number;
        message: string;
        success: boolean;
    }>;
}
