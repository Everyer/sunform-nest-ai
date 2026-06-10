import { IsString, IsOptional, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize, IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectConversationDto {
    @ApiProperty({ description: '对方用户 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly targetUserId: string;
}

export class CreateGroupConversationDto {
    @ApiProperty({ description: '群聊名称', example: '产品研发组' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ description: '群成员用户 ID 列表(含创建者)', example: ['uuid'], type: [String] })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(500)
    @IsUUID('all', { each: true })
    readonly memberIds: string[];

    @ApiProperty({ description: '群头像 URL', example: '', required: false })
    @IsString()
    @IsOptional()
    readonly avatar?: string;
}

export class RenameGroupDto {
    @ApiProperty({ description: '群聊会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly id: string;

    @ApiProperty({ description: '新的群聊名称', example: '产品研发组' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
