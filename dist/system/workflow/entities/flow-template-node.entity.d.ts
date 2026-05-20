import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateEdge } from './flow-template-edge.entity';
import { FlowNodePermission } from './flow-node-permission.entity';
export declare class FlowTemplateNode extends BaseModel {
    id: string;
    templateId: string;
    template: FlowTemplate;
    name: string;
    type: string;
    assigneeType: string;
    assigneeValue: any;
    positionX: number;
    positionY: number;
    config: any;
    order: number;
    outgoingEdges: FlowTemplateEdge[];
    incomingEdges: FlowTemplateEdge[];
    fieldPermissions: FlowNodePermission[];
}
