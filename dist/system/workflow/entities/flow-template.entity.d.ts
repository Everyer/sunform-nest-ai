import { BaseModel } from '../../../common/base.entity';
import { FlowTemplateNode } from './flow-template-node.entity';
import { FlowTemplateEdge } from './flow-template-edge.entity';
import { FlowFormDef } from './flow-form-def.entity';
import { FlowNodePermission } from './flow-node-permission.entity';
export declare class FlowTemplate extends BaseModel {
    name: string;
    code: string;
    category: string;
    description: string;
    formDefId: string;
    formDef: FlowFormDef;
    status: number;
    version: number;
    config: any;
    createdBy: string;
    nodes: FlowTemplateNode[];
    edges: FlowTemplateEdge[];
    nodePermissions: FlowNodePermission[];
}
