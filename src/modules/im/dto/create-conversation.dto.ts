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

export class AddMembersDto {
    @ApiProperty({ description: '会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;

    @ApiProperty({ description: '新加群成员 ID 列表', example: ['uuid'], type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('all', { each: true })
    readonly memberIds: string[];
}

export class RemoveMemberDto {
    @ApiProperty({ description: '会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;

    @ApiProperty({ description: '被踢人员用户 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly userId: string;
}

export class GroupActionDto {
    @ApiProperty({ description: '会话 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly conversationId: string;
}

export class RecallMessageDto {
    @ApiProperty({ description: '消息 ID', example: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    readonly messageId: string;
}

