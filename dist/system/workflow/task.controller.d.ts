import { TaskService } from './task.service';
import { TaskPageListDto, TaskDetailDto } from './dto/task.dto';
export declare class TaskController {
    private readonly service;
    constructor(service: TaskService);
    todo(dto: TaskPageListDto, req: any): Promise<{
        list: {
            taskId: string;
            instanceId: string;
            nodeName: string;
            assigneeName: string;
            createdAt: Date;
            instance: import("./entities/flow-instance.entity").FlowInstance;
        }[];
        total: number;
    }>;
    done(dto: TaskPageListDto, req: any): Promise<{
        list: {
            taskId: string;
            instanceId: string;
            nodeName: string;
            status: string;
            comment: string;
            finishedAt: Date;
            durationSeconds: number;
            instance: import("./entities/flow-instance.entity").FlowInstance;
        }[];
        total: number;
    }>;
    detail(dto: TaskDetailDto): Promise<{
        instance: import("./entities/flow-instance.entity").FlowInstance;
        currentNode: import("./entities/flow-instance-node.entity").FlowInstanceNode | undefined;
    } | null>;
}
