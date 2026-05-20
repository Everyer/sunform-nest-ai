import { BasePageDto } from '../../../common/base.dto';
export declare class StaffCreateDto {
    readonly staffName?: string;
    readonly staffCode?: string;
    readonly deptId?: string;
    readonly postId?: string;
    readonly gender?: string;
    readonly mobile?: string;
    readonly email?: string;
    readonly idCard?: string;
    readonly sort?: number;
    readonly status?: boolean;
    readonly remark?: string;
}
export declare class StaffUpdateDto extends StaffCreateDto {
    readonly id: string;
}
export declare class StaffPageListDto extends BasePageDto {
}
