import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateNode } from './flow-template-node.entity';
export declare class FlowTemplateEdge extends BaseModel {
    id: string;
    templateId: string;
    template: FlowTemplate;
    sourceNodeId: string;
    sourceNode: FlowTemplateNode;
    targetNodeId: string;
    targetNode: FlowTemplateNode;
    label: string;
    condition: any;
    order: number;
}
