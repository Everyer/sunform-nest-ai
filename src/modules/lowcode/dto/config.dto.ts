import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigCreateDto {
    @ApiProperty({ description: '基础地址', example: "/api", required: false })
    @IsString()
    @IsOptional()
    readonly baseUrl?: string;

    @ApiProperty({ description: 'Token键名', example: "Authorization", required: false })
    @IsString()
    @IsOptional()
    readonly tokenKey?: string;

    @ApiProperty({ description: 'Token值', example: "Bearer token...", required: false })
    @IsString()
    @IsOptional()
    readonly tokenValue?: string;

    @ApiProperty({ description: '主机地址', example: "http://localhost:3000", required: false })
    @IsString()
    @IsOptional()
    readonly host?: string;
}

export class ConfigUpdateDto extends ConfigCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsOptional()
    readonly id?: string;
} 