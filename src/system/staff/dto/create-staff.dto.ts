import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class StaffCreateDto {

    @ApiProperty({ description: '员工姓名', example: "张三" })
    @IsString()
    @IsNotEmpty()
    readonly staffName?: string;

    @ApiProperty({ description: '员工编号', example: "S001" })
    @IsNotEmpty()
    @IsString()
    readonly staffCode?: string;

    @ApiProperty({ description: '所属部门ID', example: "uuid-dept-id" })
    @IsNotEmpty()
    @IsString()
    readonly deptId?: string;

    @ApiProperty({ description: '所属岗位ID', example: "uuid-post-id" })
    @IsNotEmpty()
    @IsString()
    readonly postId?: string;

    @ApiProperty({ description: '性别 (0:未知, 1:男, 2:女)', example: "1" })
    @IsNotEmpty()
    @IsString()
    readonly gender?: string;

    @ApiProperty({ description: '手机号码', example: "13800138000" })
    @IsNotEmpty()
    @IsString()
    readonly mobile?: string;

    @ApiProperty({ description: '电子邮箱', example: "zhangsan@example.com" })
    @IsNotEmpty()
    @IsString()
    readonly email?: string;

    @ApiProperty({ description: '身份证号码', example: "110101199001011234" })
    @IsNotEmpty()
    @IsString()
    readonly idCard?: string;

    @ApiProperty({ description: '显示排序', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort?: number;

    @ApiProperty({ description: '员工状态 (true:在职, false:离职)', example: true })
    @IsBoolean()
    readonly status?: boolean;

    @ApiProperty({ description: '备注信息', example: "核心研发人员", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}
export class StaffUpdateDto extends StaffCreateDto {
    @ApiProperty({ description: '员工ID', example: "uuid-staff-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}
export class StaffPageListDto extends BasePageDto {
}