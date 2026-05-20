import { ComponentCreateDto, ComponentPageListDto, ComponentUpdateDto, GetConfigByOtherProjectDto } from '../dto/component.dto';
import { Component } from '../entities/component.entity';
import { User } from '../../../system/user/entities/user.entity';
export declare class ComponentService {
    private model;
    constructor(model: typeof Component);
    create(createDto: ComponentCreateDto): Promise<Component>;
    findPageList(dto: ComponentPageListDto): Promise<{
        list: Component[];
        total: number;
    }>;
    findAll(): Promise<Component[]>;
    findOne(id: string): Promise<Component | null>;
    update(dto: ComponentUpdateDto, user: User): Promise<[affectedCount: number]>;
    remove(id: string, user: User): Promise<boolean>;
    findComponentById(id: string): Promise<object>;
    findComponentByComponentCode(componentCode: string): Promise<object>;
    findByPageId(pageId: string): Promise<Component[]>;
    findByProjectId(projectId: string): Promise<Component[]>;
    getConfigByOtherProject(dto: GetConfigByOtherProjectDto): Promise<Component>;
    updateOperators(id: string, operatorIds: string[], user: User): Promise<boolean>;
}
