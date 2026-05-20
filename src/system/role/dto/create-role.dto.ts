import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RoleCreateDto {
    @ApiProperty({ description: '角色名称', example: "普通管理员" })
    @IsString()
    @IsNotEmpty()
    readonly roleName: string;

    @ApiProperty({ description: '角色权限字符 (JSON)', example: ["common"], required: false })
    @IsOptional()
    readonly roleKey?: any;

    @ApiProperty({ description: '绑定的菜单ID列表', type: [String], example: ["menu-id-1"] })
    @IsArray()
    @IsString({ each: true })
    readonly menuIds: string[];

    @ApiProperty({ description: '数据权限关联的部门ID列表', type: [String], example: [], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    readonly departmentIds?: string[];

    @ApiProperty({ description: '数据权限类型 (0:本人, 1:本部门及以下, 2:本部门, 3:自定义, 4:全部)', example: '4', enum: ['0', '1', '2', '3', '4'] })
    @IsString()
    @IsEnum(['0', '1', '2', '3', '4'])
    readonly dataScope: string;

    @ApiProperty({ description: '角色状态 (true:启用, false:禁用)', example: true })
    @IsBoolean()
    readonly status: boolean;

    @ApiProperty({ description: '备注信息', example: "具有部分管理权限的角色", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class RoleUpdateDto extends RoleCreateDto {
    @ApiProperty({ description: '角色ID', example: "uuid-role-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class RolePageListDto extends BasePageDto {
    @ApiProperty({ description: '搜索角色名称', example: "管理员", required: false })
    @IsString()
    @IsOptional()
    readonly roleName?: string;

    @ApiProperty({ description: '状态过滤', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly status?: boolean;

    @ApiProperty({ description: '数据权限过滤', example: "4", required: false })
    @IsString()
    @IsOptional()
    readonly dataScope?: string;
}