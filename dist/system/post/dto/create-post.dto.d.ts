import { BasePageDto } from '../../../common/base.dto';
export declare class CreateDto {
    readonly postName?: string;
    readonly postCode?: string;
    readonly sort?: number;
    readonly status?: boolean;
    readonly remark?: string;
}
export declare class UpdateDto extends CreateDto {
    readonly id: string;
}
export declare class PageListDto extends BasePageDto {
}
