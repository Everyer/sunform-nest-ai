import { BasePageDto } from '../../../common/base.dto';
export declare class TaskPageListDto extends BasePageDto {
    readonly title?: string;
    readonly templateId?: string;
    readonly priority?: string;
}
export declare class TaskDetailDto {
    readonly instanceId: string;
    readonly nodeId: string;
}
