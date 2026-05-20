import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class AnyExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
