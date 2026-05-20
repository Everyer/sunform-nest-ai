import { InstanceService } from './instance.service';
import { StartInstanceDto, ApproveInstanceDto, WithdrawInstanceDto, InstancePageListDto } from './dto/instance.dto';
export declare class InstanceController {
    private readonly service;
    constructor(service: InstanceService);
    start(dto: StartInstanceDto, req: any): Promise<import("./entities/flow-instance.entity").FlowInstance>;
    approve(dto: ApproveInstanceDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    withdraw(dto: WithdrawInstanceDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    list(dto: InstancePageListDto, req: any): Promise<{
        list: import("./entities/flow-instance.entity").FlowInstance[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<any>;
}
