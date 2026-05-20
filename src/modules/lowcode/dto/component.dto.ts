import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsObject, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
import { ComponentType } from '../constants/component.constants';

export class ComponentCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '组件名称', example: "按钮组件" })
    @IsString()
    @IsNotEmpty()
    readonly componentName: string;

    @ApiProperty({ description: '组件代码', example: "btn_001" })
    @IsString()
    @IsNotEmpty()
    readonly componentCode: string;

    @ApiProperty({ description: '组件类型', example: ComponentType.WEB, enum: ComponentType })
    @IsEnum(ComponentType)
    @IsNotEmpty()
    readonly componentType: ComponentType;

    @ApiProperty({ description: '组件配置', example: {}, required: false })
    @IsObject()
    @IsOptional()
    readonly componentConfig?: object;

    @ApiProperty({ description: '项目ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly projectId: string;

    @ApiProperty({ description: '页面ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly pageId: string;

    @ApiProperty({ description: '是否可用', example: true })
    @IsBoolean()
    @IsOptional()
    readonly isEnable: boolean;

    @ApiProperty({ description: '版本号', example: 100, required: false })
    @IsNumber()
    @IsOptional()
    readonly version?: number;

    @ApiProperty({ description: '备注', example: "组件备注信息", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;

    @ApiProperty({ description: '可操作人ID数组', example: ["user-id-1", "user-id-2"], required: false })
    @IsArray()
    @IsOptional()
    readonly operatorIds?: string[];
}

export class ComponentUpdateDto extends ComponentCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class ComponentPageListDto extends BasePageDto {
    @ApiProperty({ description: '组件名称', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly componentName?: string;

    @ApiProperty({ description: '组件代码', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly componentCode?: string;

    @ApiProperty({ description: '组件类型', example: ComponentType.WEB, enum: ComponentType, required: false })
    @IsEnum(ComponentType)
    @IsOptional()
    readonly componentType?: ComponentType;

    @ApiProperty({ description: '项目ID', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly projectId?: string;

    @ApiProperty({ description: '页面ID', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly pageId?: string;

    @ApiProperty({ description: '是否可用', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly isEnable?: boolean;

    @ApiProperty({ description: '创建人', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly createBy?: string;
}

export class GetConfigByOtherProjectDto {
    @ApiProperty({ description: '项目ID', example: "project-uuid-123" })
    @IsString()
    @IsNotEmpty()
    readonly projectId: string;

    @ApiProperty({ description: '组件ID', example: "component-uuid-123", required: false })
    @IsString()
    @IsOptional()
    readonly componentId?: string;

    @ApiProperty({ description: '组件代码', example: "btn_001", required: false })
    @IsString()
    @IsOptional()
    readonly componentCode?: string;
}

export class UpdateOperatorsDto {
    @ApiProperty({ description: '组件ID', example: "component-uuid-123" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @ApiProperty({ description: '可操作人ID数组', example: ["user-id-1", "user-id-2"] })
    @IsArray()
    @IsNotEmpty()
    readonly operatorIds: string[];
} 