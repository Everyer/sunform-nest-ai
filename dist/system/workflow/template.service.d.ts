import { FlowTemplate } from './entities/flow-template.entity';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowTemplateEdge } from './entities/flow-template-edge.entity';
import { FlowNodePermission } from './entities/flow-node-permission.entity';
import { CreateTemplateDto, UpdateTemplateDto, TemplatePageListDto } from './dto/template.dto';
export declare class TemplateService {
    private templateModel;
    private nodeModel;
    private edgeModel;
    private permissionModel;
    constructor(templateModel: typeof FlowTemplate, nodeModel: typeof FlowTemplateNode, edgeModel: typeof FlowTemplateEdge, permissionModel: typeof FlowNodePermission);
    create(dto: CreateTemplateDto): Promise<FlowTemplate>;
    update(dto: UpdateTemplateDto): Promise<FlowTemplate>;
    findPageList(dto: TemplatePageListDto): Promise<{
        list: FlowTemplate[];
        total: number;
    }>;
    findAll(): Promise<FlowTemplate[]>;
    findOne(id: string): Promise<FlowTemplate>;
    publish(id: string): Promise<FlowTemplate>;
    deactivate(id: string): Promise<FlowTemplate>;
    remove(id: string): Promise<boolean>;
}
