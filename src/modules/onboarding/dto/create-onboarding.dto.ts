import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';

export class OnboardingCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '台账信息ID', example: "" })
    @IsUUID()
    @IsNotEmpty()
    readonly userSurveyId: string;

    @ApiProperty({ description: '入职日期', example: "2024-01-01" })
    @IsDateString()
    @IsNotEmpty()
    readonly onboardingDate: Date;

    @ApiProperty({ description: '联系电话', example: "13800138000" })
    @IsString()
    @IsNotEmpty()
    readonly mobile: string;

    @ApiProperty({ description: '人资对接人ID', example: "" })
    @IsUUID()
    @IsNotEmpty()
    readonly hrStaffId: string;

    @ApiProperty({ description: '信息来源', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly source?: string;

    @ApiProperty({ description: '入职地点', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly location: string;

    @ApiProperty({ description: '租赁状态', example: "" })
    @IsNotEmpty()
    readonly rentalStatus: string;

    @ApiProperty({ description: '租金＋电池', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly rentWithBattery?: string;

    @ApiProperty({ description: '租金＋车', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly rentWithVehicle?: string;

    @ApiProperty({ description: '租车对接人ID', example: "" })
    @IsUUID()
    @IsNotEmpty()
    readonly rentalStaffId: string;

    @ApiProperty({ description: '是否办电话卡', example: false })
    @IsBoolean()
    readonly hasPhoneCard: boolean;

    @ApiProperty({ description: '收款方式', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly paymentMethod: string;

    @ApiProperty({ description: '备注', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class OnboardingUpdateDto extends OnboardingCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsUUID()
    @IsNotEmpty()
    readonly id: string;
}

export class OnboardingPageListDto extends BasePageDto {
    @ApiProperty({ description: '台账信息ID', example: "", required: false })
    @IsUUID()
    @IsOptional()
    readonly userSurveyId?: string;

    @ApiProperty({ description: '入职日期', example: "", required: false })
    @IsDateString()
    @IsOptional()
    readonly onboardingDate?: Date;

    @ApiProperty({ description: '联系电话', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly mobile?: string;

    @ApiProperty({ description: '人资对接人ID', example: "", required: false })
    @IsUUID()
    @IsOptional()
    readonly hrStaffId?: string;

    @ApiProperty({ description: '入职地点', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly location?: string;

    @ApiProperty({ description: '租赁状态', example: "", required: false })
    @IsUUID()
    @IsOptional()
    readonly rentalStatus?: string;

    @ApiProperty({ description: '租车对接人ID', example: "", required: false })
    @IsUUID()
    @IsOptional()
    readonly rentalStaffId?: string;

    @ApiProperty({ description: '是否办电话卡', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly hasPhoneCard?: boolean;
}