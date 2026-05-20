import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
export declare class PageCreateDto extends BaseCreateDto {
    readonly pageName: string;
    readonly projectId: string;
    readonly isEnable: boolean;
    readonly remark?: string;
}
export declare class PageUpdateDto extends PageCreateDto {
    readonly id: string;
}
export declare class PagePageListDto extends BasePageDto {
    readonly pageName?: string;
    readonly projectId?: string;
    readonly isEnable?: boolean;
    readonly createBy?: string;
}
