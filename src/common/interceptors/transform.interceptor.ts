import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiProperty } from '@nestjs/swagger';
export interface Response<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}
// 定义响应格式类
export class ResponseDto<T> {
  @ApiProperty({ description: '状态码' })
  code: number;

  @ApiProperty({ description: '提示信息' })
  message: string;

  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ 
    description: '返回数据',
  })
  data: T;
}
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        code: 200,
        message: '操作成功',
        success: true,
      })),
    );
  }
}