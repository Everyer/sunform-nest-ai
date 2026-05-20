import { BasePageDto } from '../../../common/base.dto';
export declare class UserCreateDto {
    readonly username: string;
    readonly password: string;
    readonly staffId: string;
    readonly roleIds: string[];
    readonly dataScope?: string;
    readonly sort: number;
    readonly status: boolean;
    readonly remark?: string;
}
export declare class UserUpdateDto extends UserCreateDto {
    readonly id: string;
}
export declare class UserPageListDto extends BasePageDto {
    readonly username?: string;
    readonly deptId?: string;
    readonly status?: boolean;
}
