import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
export declare class ProjectCreateDto extends BaseCreateDto {
    readonly projectName: string;
    readonly isEnable: boolean;
    readonly remark?: string;
}
export declare class ProjectUpdateDto extends ProjectCreateDto {
    readonly id: string;
}
export declare class ProjectPageListDto extends BasePageDto {
    readonly projectName?: string;
    readonly isEnable?: boolean;
    readonly createBy?: string;
}
