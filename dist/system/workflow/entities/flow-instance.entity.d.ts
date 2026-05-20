import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowFormDef } from './flow-form-def.entity';
import { FlowInstanceNode } from './flow-instance-node.entity';
import { FlowInstanceData } from './flow-instance-data.entity';
export declare class FlowInstance extends BaseModel {
    templateId: string;
    template: FlowTemplate;
    templateVersion: number;
    formDefId: string;
    formDef: FlowFormDef;
    title: string;
    status: string;
    initiator: string;
    initiatorDept: string;
    currentNodeIds: string[];
    priority: number;
    dueDate: Date;
    finishedAt: Date;
    nodes: FlowInstanceNode[];
    dataSnapshots: FlowInstanceData[];
}
