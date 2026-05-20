import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class MenuCreateDto {
    @ApiProperty({ description: '父级菜单ID', example: "0", required: false })
    @IsString()
    @IsOptional()
    readonly pid?: string;

    @ApiProperty({ description: '菜单/目录名称', example: "系统管理" })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ description: '唯一标识编码', example: "SystemModule" })
    @IsString()
    @IsNotEmpty()
    readonly code: string;

    @ApiProperty({ description: '是否在导航栏显示', example: true })
    @IsBoolean()
    @IsNotEmpty()
    readonly isNav: boolean;

    @ApiProperty({ description: '类型 (menu:菜单, comp:组件/页面)', example: 'menu', enum: ['menu', 'comp'] })
    @IsString()
    @IsEnum(['menu', 'comp'])
    @IsNotEmpty()
    readonly type: string;

    @ApiProperty({ description: '图标类名', example: "i-lucide-settings", required: false })
    @IsString()
    @IsOptional()
    readonly icon?: string;

    @ApiProperty({ description: '路由路径', example: "/system" })
    @IsString()
    @IsNotEmpty()
    readonly path: string;

    @ApiProperty({ description: '前端组件相对路径', example: "layout/index", required: false })
    @IsString()
    @IsOptional()
    readonly component?: string;

    @ApiProperty({ description: '低代码页面编码', example: "page_123", required: false })
    @IsString()
    @IsOptional()
    readonly lowCodeCode?: string;

    @ApiProperty({ description: '菜单状态 (true:显示, false:隐藏)', example: true })
    @IsBoolean()
    readonly status: boolean;

    @ApiProperty({ description: '显示排序', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort: number;

    @ApiProperty({ description: '备注信息', example: "系统核心管理模块", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class MenuUpdateDto extends MenuCreateDto {
    @ApiProperty({ description: '菜单ID', example: "uuid-menu-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class MenuPageListDto extends BasePageDto {
    @ApiProperty({ description: '搜索菜单名称', example: "管理", required: false })
    @IsString()
    @IsOptional()
    readonly name?: string;

    @ApiProperty({ description: '搜索编码', example: "System", required: false })
    @IsString()
    @IsOptional()
    readonly code?: string;

    @ApiProperty({ description: '类型过滤', example: "menu", required: false })
    @IsString()
    @IsOptional()
    readonly type?: string;

    @ApiProperty({ description: '状态过滤', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly status?: boolean;
}