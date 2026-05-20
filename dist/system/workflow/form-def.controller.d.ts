import { FormDefService } from './form-def.service';
import { CreateFormDefDto, UpdateFormDefDto, FormDefPageListDto } from './dto/form-def.dto';
export declare class FormDefController {
    private readonly service;
    constructor(service: FormDefService);
    create(dto: CreateFormDefDto): Promise<import("./entities/flow-form-def.entity").FlowFormDef>;
    update(dto: UpdateFormDefDto): Promise<import("./entities/flow-form-def.entity").FlowFormDef>;
    list(dto: FormDefPageListDto): Promise<{
        list: import("./entities/flow-form-def.entity").FlowFormDef[];
        total: number;
    }>;
    findAll(): Promise<import("./entities/flow-form-def.entity").FlowFormDef[]>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/flow-form-def.entity").FlowFormDef>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
}
