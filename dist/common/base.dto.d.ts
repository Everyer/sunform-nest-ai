export declare class BaseResponseDto {
    code: number;
    message: string;
    success: boolean;
    data: any;
}
export declare class BaseCreateDto {
    readonly createBy?: string;
}
export declare class BasePageDto {
    readonly pageindex: number;
    readonly pagesize: number;
}
