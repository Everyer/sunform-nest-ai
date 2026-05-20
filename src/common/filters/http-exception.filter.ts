import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    response
      .status(status)
      .json({
        code: exceptionResponse.code || status,
        message: exceptionResponse.message || exception.message,
        success: exceptionResponse.success !== undefined ? exceptionResponse.success : false,
        data: null
      });
  }
}