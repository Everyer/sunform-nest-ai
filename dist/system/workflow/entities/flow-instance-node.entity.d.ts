import { BaseModel } from '../../../common/base.entity';
import { FlowInstance } from './flow-instance.entity';
import { FlowTemplateNode } from './flow-template-node.entity';
export declare class FlowInstanceNode extends BaseModel {
    instanceId: string;
    instance: FlowInstance;
    templateNodeId: string;
    templateNode: FlowTemplateNode;
    nodeName: string;
    nodeType: string;
    status: string;
    assignee: string;
    assigneeName: string;
    comment: string;
    attachments: any;
    startedAt: Date;
    finishedAt: Date;
    durationSeconds: number;
}
