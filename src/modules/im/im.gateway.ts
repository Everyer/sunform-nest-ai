import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { ImService } from './im.service';
import { PresenceService } from './presence.service';

@WebSocketGateway({
    cors: { origin: '*', credentials: true },
    namespace: '/im',
    transports: ['websocket', 'polling'],
})
export class ImGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(ImGateway.name);

    constructor(
        private readonly jwt: JwtService,
        private readonly presence: PresenceService,
        @Inject(forwardRef(() => ImService))
        private readonly service: ImService,
    ) {}

    // ============================================================
    // 连接鉴权:从 handshake.auth.token 拿 JWT
    // ============================================================
    async handleConnection(socket: Socket) {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                socket.emit('auth:error', { message: '缺少 token' });
                socket.disconnect(true);
                return;
            }
            const payload: any = this.jwt.verify(token, {
                secret: process.env.JWT_SECRET as string,
            });
            const userId = payload?.sub || payload?.id;
            if (!userId) {
                socket.emit('auth:error', { message: 'token 无效' });
                socket.disconnect(true);
                return;
            }

            // 注册在线
            (socket as any).userId = userId;
            this.presence.add(userId, socket.id);

            // 个人房间
            socket.join(`user:${userId}`);

            // 加入所有我所在的会话房间
            const convIds = await this.service.getMyConversationIds(userId);
            for (const cid of convIds) {
                socket.join(`conv:${cid}`);
            }

            this.logger.log(`IM socket connected: user=${userId} socket=${socket.id} convs=${convIds.length}`);

            // 广播我的上线状态
            this.server.emit('presence', { userId, online: true });

            // 给客户端回执一份已加入的会话 id 列表
            socket.emit('ready', { userId, conversationIds: convIds });
        } catch (e: any) {
            this.logger.warn(`IM socket auth failed: ${e.message}`);
            socket.emit('auth:error', { message: 'token 校验失败' });
            socket.disconnect(true);
        }
    }

    async handleDisconnect(socket: Socket) {
        const r = this.presence.remove(socket.id);
        if (r && r.nowOffline) {
            this.logger.log(`IM socket offline: user=${r.userId}`);
            this.server.emit('presence', { userId: r.userId, online: false });
        }
    }

    // ============================================================
    // 消息发送(实时通道)
    // ============================================================
    @SubscribeMessage('message:send')
    async onMessageSend(
        @ConnectedSocket() socket: Socket,
        @MessageBody() body: {
            conversationId: string;
            type: 'text' | 'image' | 'file' | 'system';
            content?: string;
            attachmentName?: string;
            attachmentUrl?: string;
            attachmentSize?: number;
            attachmentMime?: string;
            mentions?: string[];
            replyToMessageId?: string;
        },
    ) {
        const userId = (socket as any).userId;
        if (!userId) return { ok: false, reason: 'unauthorized' };

        try {
            const msg = await this.service.saveMessage({
                conversationId: body.conversationId,
                senderId: userId,
                type: body.type,
                content: body.content,
                attachmentName: body.attachmentName,
                attachmentUrl: body.attachmentUrl,
                attachmentSize: body.attachmentSize,
                attachmentMime: body.attachmentMime,
                mentions: body.mentions && body.mentions.length ? JSON.stringify(body.mentions) : null,
                replyToMessageId: body.replyToMessageId || null,
            });

            const fullMsg = await this.reloadMessage(msg.id);

            // 广播到会话房间(所有成员)
            this.server.to(`conv:${body.conversationId}`).emit('message:new', fullMsg);

            // 🌟 关键:同时发给 sender 的个人房间。
            //   新建的会话是走 REST 创建的,sender 的 socket 当时并没有 join 到
            //   conv:${id} 房间(只在下一次连接时才会从 DB 拉会话 join 进去),
            //   不补这一发的话,sender 发送后自己的消息要切走再切回(触发
            //   loadHistory 从 DB 重拉)才能看到,实时性炸了。
            //   客户端 receiveMessage 里有按 id 去重,不会重复入列。
            this.server.to(`user:${userId}`).emit('message:new', fullMsg);

            return { ok: true, message: fullMsg };
        } catch (e: any) {
            this.logger.warn(`message:send failed: ${e.message}`);
            return { ok: false, reason: e.message };
        }
    }

    // ============================================================
    // 推进已读
    // ============================================================
    @SubscribeMessage('message:read')
    async onMessageRead(
        @ConnectedSocket() socket: Socket,
        @MessageBody() body: { conversationId: string; lastReadMessageId: string },
    ) {
        const userId = (socket as any).userId;
        if (!userId) return { ok: false };
        const res = await this.service.markRead(userId, body.conversationId, body.lastReadMessageId);
        return res;
    }

    // ============================================================
    // 正在输入
    // ============================================================
    @SubscribeMessage('typing:start')
    onTypingStart(@ConnectedSocket() socket: Socket, @MessageBody() body: { conversationId: string }) {
        const userId = (socket as any).userId;
        if (!userId) return;
        socket.to(`conv:${body.conversationId}`).emit('typing', {
            conversationId: body.conversationId,
            userId,
            isTyping: true,
        });
    }

    @SubscribeMessage('typing:stop')
    onTypingStop(@ConnectedSocket() socket: Socket, @MessageBody() body: { conversationId: string }) {
        const userId = (socket as any).userId;
        if (!userId) return;
        socket.to(`conv:${body.conversationId}`).emit('typing', {
            conversationId: body.conversationId,
            userId,
            isTyping: false,
        });
    }

    // ============================================================
    // 内部方法:广播已读、通知会话更新、清空历史
    // ============================================================
    broadcastRead(conversationId: string, payload: any) {
        this.server.to(`conv:${conversationId}`).emit('message:read', payload);
    }

    notifyConversationUpdate(userId: string, conversationId: string) {
        const socketIds = this.presence.getSockets(userId);
        for (const sid of socketIds) {
            const socket = this.server.sockets.sockets.get(sid);
            if (socket) {
                socket.join(`conv:${conversationId}`);
                this.logger.log(`Auto join room: socket=${sid} joined conv:${conversationId}`);
            }
        }
        this.server.to(`user:${userId}`).emit('conversation:update', { conversationId });
    }

    /**
     * 广播"会话历史被清空"事件给该会话所有成员,
     * 客户端收到后清掉本地 messagesByConv[convId] 和会话的最后一条预览。
     */
    broadcastConversationCleared(conversationId: string, payload: any) {
        this.server.to(`conv:${conversationId}`).emit('conversation:cleared', payload);
    }

    /**
     * 广播"会话元数据被更新"事件(目前用于重命名群聊),
     * 同时给所有成员的 personal room 兜底发一份,避免有成员不在 conv 房间。
     */
    broadcastConversationUpdated(conversationId: string, payload: any, extraUserIds: string[] = []) {
        this.server.to(`conv:${conversationId}`).emit('conversation:updated', payload);
        for (const uid of extraUserIds) {
            this.server.to(`user:${uid}`).emit('conversation:updated', payload);
        }
    }

    private async reloadMessage(messageId: string) {
        const { Message } = await import('./entities/message.entity');
        const { User } = await import('../../system/user/entities/user.entity');
        const { Staff } = await import('../../system/staff/entities/staff.entity');
        // Message 的 BelongsTo 别名是 sender(不是默认的 user),include 必须
        // 显式写 as: 'sender',否则 Sequelize 找不到关联 → msg.sender 为 undefined
        // → 前端头像取不到 staffName,fallback 到"?"(theirs) / "我"(mine)。
        return await Message.findByPk(messageId, {
            include: [
                {
                    model: User, as: 'sender',
                    attributes: ['id', 'username', 'staffId'],
                    include: [{ model: Staff, attributes: ['staffName'] }],
                },
                {
                    model: Message, as: 'replyTo',
                    include: [
                        {
                            model: User, as: 'sender',
                            attributes: ['id', 'username', 'staffId'],
                            include: [{ model: Staff, attributes: ['staffName'] }],
                        },
                    ],
                },
            ],
        });
    }
}
