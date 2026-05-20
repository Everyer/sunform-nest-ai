import { BasePageDto } from '../../../common/base.dto';
export declare class DictCreateDto {
    readonly pid?: string;
    readonly label: string;
    readonly value: string;
    readonly status: boolean;
    readonly sort: number;
    readonly remark?: string;
}
export declare class DictUpdateDto extends DictCreateDto {
    readonly id: string;
}
export declare class DictPageListDto extends BasePageDto {
    readonly label?: string;
    readonly value?: string;
    readonly status?: boolean;
}
