import { BasePageDto } from '../../../common/base.dto';
export declare class StartInstanceDto {
    readonly templateId: string;
    readonly title?: string;
    readonly formData: any;
    readonly draft?: boolean;
    readonly priority?: number;
    readonly dueDate?: string;
    readonly attachments?: any[];
    readonly instanceId?: string;
}
export declare class ApproveInstanceDto {
    readonly instanceId: string;
    readonly nodeId: string;
    readonly action: string;
    readonly comment?: string;
    readonly formData?: any;
    readonly transferTo?: string;
    readonly addSignTo?: string;
    readonly attachments?: any[];
}
export declare class WithdrawInstanceDto {
    readonly instanceId: string;
}
export declare class InstancePageListDto extends BasePageDto {
    readonly title?: string;
    readonly status?: string;
    readonly templateId?: string;
}
