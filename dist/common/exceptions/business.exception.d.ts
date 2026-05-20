import { HttpException } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    constructor(message: string);
}
