import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface Response<T> {
    data: T;
    code: number;
    message: string;
    success: boolean;
}
export declare class ResponseDto<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>>;
}
