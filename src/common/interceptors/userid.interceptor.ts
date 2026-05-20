import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserIdInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // 假设 JwtAuthGuard 已经将用户信息添加到请求对象中

        if (user && user.id) {
            if (request.body && request.body.createBy === undefined) {
                request.body.createBy = user.id;
            }
        }

        return next.handle();
    }
}