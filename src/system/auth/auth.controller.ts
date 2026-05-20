import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { BusinessException } from '../../common/exceptions/business.exception';
import {LoginDto} from './dto/auth.dto'
@ApiTags('权限认证')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @ApiOperation({ summary: '用户登录' })
    @Post('login')
    async login(@Body() dto:LoginDto) {
        const user = await this.authService.validateUser(
            dto.username,
            dto.password,
        );
        if (!user) {
            throw new BusinessException('用户名或密码错误');
        }
        return this.authService.login(user);
    }
}
