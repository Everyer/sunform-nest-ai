import { BasePageDto } from '../../../common/base.dto';
export declare class RoleCreateDto {
    readonly roleName: string;
    readonly roleKey?: any;
    readonly menuIds: string[];
    readonly departmentIds?: string[];
    readonly dataScope: string;
    readonly status: boolean;
    readonly remark?: string;
}
export declare class RoleUpdateDto extends RoleCreateDto {
    readonly id: string;
}
export declare class RolePageListDto extends BasePageDto {
    readonly roleName?: string;
    readonly status?: boolean;
    readonly dataScope?: string;
}
