import { Sequelize } from 'sequelize-typescript';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowInstanceNode } from './entities/flow-instance-node.entity';
import { FlowInstanceData } from './entities/flow-instance-data.entity';
import { FlowTemplate } from './entities/flow-template.entity';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowTemplateEdge } from './entities/flow-template-edge.entity';
import { FlowNodePermission } from './entities/flow-node-permission.entity';
import { StartInstanceDto, ApproveInstanceDto, InstancePageListDto } from './dto/instance.dto';
import { NodeExecutorService } from './node-executor.service';
export declare class InstanceService {
    private instanceModel;
    private instanceNodeModel;
    private instanceDataModel;
    private templateModel;
    private templateNodeModel;
    private templateEdgeModel;
    private permissionModel;
    private nodeExecutorService;
    private sequelize;
    constructor(instanceModel: typeof FlowInstance, instanceNodeModel: typeof FlowInstanceNode, instanceDataModel: typeof FlowInstanceData, templateModel: typeof FlowTemplate, templateNodeModel: typeof FlowTemplateNode, templateEdgeModel: typeof FlowTemplateEdge, permissionModel: typeof FlowNodePermission, nodeExecutorService: NodeExecutorService, sequelize: Sequelize);
    start(dto: StartInstanceDto, username: string): Promise<FlowInstance>;
    approve(dto: ApproveInstanceDto, username: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private handleAgree;
    private handleReject;
    private handleTransfer;
    private createNextNode;
    withdraw(instanceId: string, username: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findPageList(dto: InstancePageListDto, username: string): Promise<{
        list: FlowInstance[];
        total: number;
    }>;
    findOne(id: string): Promise<any>;
}
