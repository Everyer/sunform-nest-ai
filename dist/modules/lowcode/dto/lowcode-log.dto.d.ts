import { BasePageDto } from '../../../common/base.dto';
export declare class LowcodeLogCreateDto {
    readonly componentCode: string;
    readonly componentConfig: object;
    readonly componentName: string;
}
export declare class LowcodeLogPageListDto extends BasePageDto {
    readonly componentCode?: string;
    readonly componentName?: string;
}
export declare class LowcodeLogByCodeDto {
    readonly componentCode: string;
}
export declare class LowcodeLogPageByCodeDto extends BasePageDto {
    readonly componentCode: string;
}
export declare class LowcodeLogUpdateRemarkDto {
    readonly id: string;
    readonly remark?: string;
}
