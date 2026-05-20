import { FlowInstance } from './entities/flow-instance.entity';
import { FlowInstanceNode } from './entities/flow-instance-node.entity';
import { TaskPageListDto } from './dto/task.dto';
export declare class TaskService {
    private instanceModel;
    private nodeModel;
    constructor(instanceModel: typeof FlowInstance, nodeModel: typeof FlowInstanceNode);
    findTodo(dto: TaskPageListDto, username: string): Promise<{
        list: {
            taskId: string;
            instanceId: string;
            nodeName: string;
            assigneeName: string;
            createdAt: Date;
            instance: FlowInstance;
        }[];
        total: number;
    }>;
    findDone(dto: TaskPageListDto, username: string): Promise<{
        list: {
            taskId: string;
            instanceId: string;
            nodeName: string;
            status: string;
            comment: string;
            finishedAt: Date;
            durationSeconds: number;
            instance: FlowInstance;
        }[];
        total: number;
    }>;
    detail(instanceId: string, nodeId: string): Promise<{
        instance: FlowInstance;
        currentNode: FlowInstanceNode | undefined;
    } | null>;
}
