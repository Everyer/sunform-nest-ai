import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';

export class PrintTemplateCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '模板ID标识', example: "tpl_sales_order" })
    @IsString()
    @IsNotEmpty()
    readonly templateId: string;

    @ApiProperty({ description: '模板名称', example: "标准销售订单打印模板" })
    @IsString()
    @IsNotEmpty()
    readonly templateName: string;

    @ApiProperty({ description: '关联的详情接口 apiPath', example: "/api/v1/sales/order/detail", required: false })
    @IsString()
    @IsOptional()
    readonly apiPath?: string;

    @ApiProperty({ description: '纸张尺寸预设', example: "A4", required: false })
    @IsString()
    @IsOptional()
    readonly paperSizePreset?: string;

    @ApiProperty({ description: '纸张宽度 (mm)', example: 210, required: false })
    @IsNumber()
    @IsOptional()
    readonly paperWidth?: number;

    @ApiProperty({ description: '纸张高度 (mm)', example: 297, required: false })
    @IsNumber()
    @IsOptional()
    readonly paperHeight?: number;

    @ApiProperty({ description: '是否横向', example: false, required: false })
    @IsBoolean()
    @IsOptional()
    readonly isLandscape?: boolean;

    @ApiProperty({ description: '网格步长 (mm)', example: 5, required: false })
    @IsNumber()
    @IsOptional()
    readonly gridSize?: number;

    @ApiProperty({ description: '四边距 JSON', example: '{"top":10,"bottom":10,"left":10,"right":10}', required: false })
    @IsString()
    @IsOptional()
    readonly pageMargins?: string;

    @ApiProperty({ description: '画布元素组件 JSON Payload' })
    @IsString()
    @IsNotEmpty()
    readonly elementsJson: string;

    @ApiProperty({ description: '所属的项目应用 ID', example: "app_erp_prod", required: false })
    @IsString()
    @IsOptional()
    readonly appId?: string;

    @ApiProperty({ description: '备注', example: "财务部门专用", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;

    @ApiProperty({ description: '数据接口请求方法 GET/POST', example: "POST", required: false })
    @IsString()
    @IsOptional()
    readonly testMethod?: string;

    @ApiProperty({ description: '数据接口高级请求参数 JSON', example: '{}', required: false })
    @IsString()
    @IsOptional()
    readonly testParams?: string;
}

export class PrintTemplateUpdateDto extends PrintTemplateCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class PrintTemplatePageListDto extends BasePageDto {
    @ApiProperty({ description: '模板名称或标识模糊检索', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly searchKey?: string;

    @ApiProperty({ description: '所属的应用/项目分类筛选', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly appId?: string;
}
