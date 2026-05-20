import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string) {
    super(
      {
        code: HttpStatus.BAD_REQUEST,
        message,
        success: false,
      },
      HttpStatus.OK,
    );
  }
}