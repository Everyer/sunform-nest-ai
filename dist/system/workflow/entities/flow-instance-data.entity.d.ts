import { BaseModel } from '../../../common/base.entity';
import { FlowInstance } from './flow-instance.entity';
import { FlowInstanceNode } from './flow-instance-node.entity';
export declare class FlowInstanceData extends BaseModel {
    instanceId: string;
    instance: FlowInstance;
    nodeId: string;
    node: FlowInstanceNode;
    data: any;
    dataVersion: number;
}
