import { BasePageDto } from '../../../common/base.dto';
export declare class MenuCreateDto {
    readonly pid?: string;
    readonly name: string;
    readonly code: string;
    readonly isNav: boolean;
    readonly type: string;
    readonly icon?: string;
    readonly path: string;
    readonly component?: string;
    readonly lowCodeCode?: string;
    readonly status: boolean;
    readonly sort: number;
    readonly remark?: string;
}
export declare class MenuUpdateDto extends MenuCreateDto {
    readonly id: string;
}
export declare class MenuPageListDto extends BasePageDto {
    readonly name?: string;
    readonly code?: string;
    readonly type?: string;
    readonly status?: boolean;
}
