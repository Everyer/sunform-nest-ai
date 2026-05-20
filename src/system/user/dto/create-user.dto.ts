import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, IsArray, IsUUID } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserCreateDto {
    @ApiProperty({ description: '登录用户名', example: "admin" })
    @IsString()
    @IsNotEmpty()
    readonly username: string;

    @ApiProperty({ description: '登录密码', example: "123456" })
    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @ApiProperty({ description: '关联员工ID', example: "uuid-staff-id" })
    @IsUUID()
    @IsNotEmpty()
    readonly staffId: string;

    @ApiProperty({ description: '分配的角色ID列表', type: [String], example: ["role-id-1"] })
    @IsArray()
    @IsString({ each: true })
    readonly roleIds: string[];

    @ApiProperty({ description: '数据权限范围', example: "1", required: false })
    @IsString()
    @IsOptional()
    readonly dataScope?: string;

    @ApiProperty({ description: '排序号', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort: number;

    @ApiProperty({ description: '账号状态 (true:启用, false:禁用)', example: true })
    @IsBoolean()
    readonly status: boolean;

    @ApiProperty({ description: '备注信息', example: "超级管理员账号", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class UserUpdateDto extends UserCreateDto {
    @ApiProperty({ description: '用户ID', example: "uuid-user-id" })
    @IsUUID()
    @IsNotEmpty()
    readonly id: string;
}

export class UserPageListDto extends BasePageDto {
    @ApiProperty({ description: '搜索用户名', example: "admin", required: false })
    @IsString()
    @IsOptional()
    readonly username?: string;

    @ApiProperty({ description: '过滤部门ID', example: "uuid-dept-id", required: false })
    @IsUUID()
    @IsOptional()
    readonly deptId?: string;

    @ApiProperty({ description: '状态过滤', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly status?: boolean;
}