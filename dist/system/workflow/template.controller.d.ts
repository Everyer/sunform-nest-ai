import { TemplateService } from './template.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplatePageListDto, PublishTemplateDto } from './dto/template.dto';
export declare class TemplateController {
    private readonly service;
    constructor(service: TemplateService);
    create(dto: CreateTemplateDto): Promise<import("./entities/flow-template.entity").FlowTemplate>;
    update(dto: UpdateTemplateDto): Promise<import("./entities/flow-template.entity").FlowTemplate>;
    list(dto: TemplatePageListDto): Promise<{
        list: import("./entities/flow-template.entity").FlowTemplate[];
        total: number;
    }>;
    findAll(): Promise<import("./entities/flow-template.entity").FlowTemplate[]>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/flow-template.entity").FlowTemplate>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    publish(dto: PublishTemplateDto): Promise<import("./entities/flow-template.entity").FlowTemplate>;
    deactivate(dto: {
        id: string;
    }): Promise<import("./entities/flow-template.entity").FlowTemplate>;
}
