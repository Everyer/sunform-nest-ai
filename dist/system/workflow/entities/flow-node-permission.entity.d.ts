import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateNode } from './flow-template-node.entity';
export declare class FlowNodePermission extends BaseModel {
    templateId: string;
    template: FlowTemplate;
    nodeId: string;
    node: FlowTemplateNode;
    fieldKey: string;
    permission: string;
}
