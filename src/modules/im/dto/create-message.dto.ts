import { IsString, IsOptional, IsNotEmpty, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ description: '所属会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;

    @ApiProperty({ description: '消息类型', example: 'text', enum: ['text', 'image', 'file', 'system'] })
    @IsString()
    @IsIn(['text', 'image', 'file', 'system'])
    readonly type: 'text' | 'image' | 'file' | 'system';

    @ApiProperty({ description: '文字内容(系统消息文案)', example: '你好', required: false })
    @IsString()
    @IsOptional()
    readonly content?: string;

    @ApiProperty({ description: '附件展示名', example: 'report.pdf', required: false })
    @IsString()
    @IsOptional()
    readonly attachmentName?: string;

    @ApiProperty({ description: '附件访问 URL', example: '/static/im-uploads/xxx.pdf', required: false })
    @IsString()
    @IsOptional()
    readonly attachmentUrl?: string;

    @ApiProperty({ description: '附件大小(字节)', example: 1024, required: false })
    @IsOptional()
    readonly attachmentSize?: number;

    @ApiProperty({ description: '附件 MIME 类型', example: 'application/pdf', required: false })
    @IsString()
    @IsOptional()
    readonly attachmentMime?: string;
}
