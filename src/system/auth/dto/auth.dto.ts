import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
    @ApiProperty({ description: '登录用户名', example: "admin", required: true })
    @IsString()
    @IsNotEmpty()
    readonly username: string;

    @ApiProperty({ description: '登录密码', example: "123456", required: true })
    @IsString()
    @IsNotEmpty()
    readonly password: string;
}