import {
    Controller, Post, Get, Body, Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../system/auth/jwt-auth.guard';
import { ImService } from './im.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
    CreateDirectConversationDto,
    CreateGroupConversationDto,
    RenameGroupDto,
} from './dto/create-conversation.dto';
import { QueryMessageDto, MarkReadDto } from './dto/query-message.dto';

@ApiTags('IM 即时聊天')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('im')
export class ImController {
    constructor(private readonly service: ImService) {}

    @ApiOperation({ summary: '可聊天的联系人列表(排除自己)' })
    @Post('contacts/list')
    async listContacts(@Req() req: any) {
        return this.service.listContacts(req.user.id);
    }

    @ApiOperation({ summary: '我参与的所有会话(含未读 + 最后消息)' })
    @Post('conversations/list')
    async listConversations(@Req() req: any) {
        return this.service.listMyConversations(req.user.id);
    }

    @ApiOperation({ summary: '会话详情(含成员)' })
    @Post('conversations/detail')
    async conversationDetail(@Body() dto: { id: string }, @Req() req: any) {
        return this.service.getConversationDetail(dto.id, req.user.id);
    }

    @ApiOperation({ summary: '创建/获取一对一会话(幂等)' })
    @Post('conversations/createDirect')
    async createDirect(@Body() dto: CreateDirectConversationDto, @Req() req: any) {
        const id = await this.service.createDirectConversation(req.user.id, dto.targetUserId);
        return { id };
    }

    @ApiOperation({ summary: '创建群聊' })
    @Post('conversations/createGroup')
    async createGroup(@Body() dto: CreateGroupConversationDto, @Req() req: any) {
        const id = await this.service.createGroupConversation(
            req.user.id,
            dto.name,
            dto.memberIds,
            dto.avatar,
        );
        return { id };
    }

    @ApiOperation({ summary: '重命名群聊(必须是群成员)' })
    @Post('conversations/rename')
    async renameGroup(@Body() dto: RenameGroupDto, @Req() req: any) {
        return this.service.renameGroupConversation(req.user.id, dto.id, dto.name);
    }

    @ApiOperation({ summary: '历史消息(倒序分页)' })
    @Post('messages/page')
    async messagesPage(@Body() dto: QueryMessageDto, @Req() req: any) {
        return this.service.getMessages(
            req.user.id,
            dto.conversationId,
            dto.pageindex,
            dto.pagesize,
            dto.beforeMessageId,
        );
    }

    @ApiOperation({ summary: '发送消息(REST,Gateway 也提供实时通道)' })
    @Post('messages/send')
    async sendMessage(@Body() dto: CreateMessageDto, @Req() req: any) {
        const msg = await this.service.saveMessage({
            conversationId: dto.conversationId,
            senderId: req.user.id,
            type: dto.type,
            content: dto.content,
            attachmentName: dto.attachmentName,
            attachmentUrl: dto.attachmentUrl,
            attachmentSize: dto.attachmentSize,
            attachmentMime: dto.attachmentMime,
        });
        return msg;
    }

    @ApiOperation({ summary: '推进已读指针' })
    @Post('messages/markRead')
    async markRead(@Body() dto: MarkReadDto, @Req() req: any) {
        return this.service.markRead(req.user.id, dto.conversationId, dto.lastReadMessageId);
    }

    @ApiOperation({ summary: '群聊消息已读回执' })
    @Post('messages/markGroupRead')
    async markGroupRead(@Body() dto: { messageId: string }, @Req() req: any) {
        return this.service.markGroupMessageRead(req.user.id, dto.messageId);
    }

    @ApiOperation({ summary: '清空会话历史(所有成员的消息都会被删,会话保留)' })
    @Post('messages/clear')
    async clearHistory(@Body() dto: { conversationId: string }, @Req() req: any) {
        return this.service.clearHistory(req.user.id, dto.conversationId);
    }

    @ApiOperation({ summary: '上传附件' })
    @ApiConsumes('multipart/form-data')
    @Post('attachments/upload')
    @UseInterceptors(FileInterceptor('file', {
        dest: 'temp_attachments',
        limits: { fileSize: 20 * 1024 * 1024 },
    }))
    async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
        return this.service.saveAttachment(file);
    }
}
