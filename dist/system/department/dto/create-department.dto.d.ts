import { BasePageDto } from '../../../common/base.dto';
export declare class DepartmentCreateDto {
    readonly pid?: string;
    readonly departmentName?: string;
    readonly leader?: string;
    readonly sort?: number;
    readonly status?: boolean;
    readonly remark?: string;
}
export declare class DepartmentUpdateDto extends DepartmentCreateDto {
    readonly id: string;
}
export declare class DepartmentPageListDto extends BasePageDto {
}
