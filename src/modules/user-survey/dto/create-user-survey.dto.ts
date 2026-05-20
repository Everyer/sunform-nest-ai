import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';

export class UserSurveyCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '姓名', example: "张三" })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ description: '性别', example: "1" })
    @IsString()
    @IsNotEmpty()
    readonly gender: string;

    @ApiProperty({ description: '年龄', example: "25" })
    @IsString()
    @IsOptional()
    readonly age: string;

    @ApiProperty({ description: '手机号码', example: "13800138000" })
    @IsString()
    @IsNotEmpty()
    readonly mobile: string;

    @ApiProperty({ description: '目前在哪个城市', example: "北京" })
    @IsString()
    @IsOptional()
    readonly address?: string;

    @ApiProperty({ description: '岗位意向', example: "销售" })
    @IsString()
    @IsOptional()
    readonly postIntention?: string;

    @ApiProperty({ description: '是否需要提供住宿', example: false })
    @IsBoolean()
    readonly needAccommodation: boolean;

    @ApiProperty({ description: '是否需要提供食宿及交通补贴', example: false })
    @IsBoolean()
    readonly needAccommodationAndTransportation: boolean;

    @ApiProperty({ description: '备注', example: "" })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class UserSurveyUpdateDto extends UserSurveyCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class UserSurveyPageListDto extends BasePageDto {
    @ApiProperty({ description: '姓名', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly name?: string;

    @ApiProperty({ description: '性别', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly gender?: string;

    @ApiProperty({ description: '年龄', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly age?: string;

    @ApiProperty({ description: '手机号码', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly mobile?: string;

    @ApiProperty({ description: '目前在哪个城市', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly address?: string;

    @ApiProperty({ description: '岗位意向', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly postIntention?: string;

    @ApiProperty({ description: '创建人', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly createBy?: string;
}