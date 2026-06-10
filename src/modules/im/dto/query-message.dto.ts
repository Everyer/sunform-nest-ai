import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '../../../common/base.dto';

export class QueryMessageDto extends BasePageDto {
    @ApiProperty({ description: '所属会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;

    @ApiProperty({ description: '起始消息 ID(用于上拉加载更多历史)', example: '', required: false })
    @IsUUID()
    @IsOptional()
    readonly beforeMessageId?: string;
}

export class MarkReadDto {
    @ApiProperty({ description: '会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;

    @ApiProperty({ description: '已读到的最后消息 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly lastReadMessageId: string;
}
