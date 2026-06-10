import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { User } from '../../system/user/entities/user.entity';
import { Staff } from '../../system/staff/entities/staff.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ImGateway } from './im.gateway';

@Injectable()
export class ImService {
    constructor(
        @InjectModel(Conversation)
        private convModel: typeof Conversation,
        @InjectModel(ConversationMember)
        private memberModel: typeof ConversationMember,
        @InjectModel(Message)
        private msgModel: typeof Message,
        @InjectModel(MessageRead)
        private readModel: typeof MessageRead,
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Staff)
        private staffModel: typeof Staff,
        @Inject(forwardRef(() => ImGateway))
        private gateway: ImGateway,
    ) {}

    // ============================================================
    // 联系人列表(可聊天的用户,排除自己)
    // ============================================================
    async listContacts(currentUserId: string) {
        const users = await this.userModel.findAll({
            where: {
                id: { [Op.ne]: currentUserId },
                status: true,
            },
            attributes: ['id', 'username', 'staffId', 'deptId'],
            include: [
                { model: Staff, attributes: ['staffName'] },
                { model: require('../../system/department/entities/department.entity').Department, attributes: ['id', 'departmentName'] },
            ],
            order: [['sort', 'ASC']],
        });
        return users.map((u: any) => ({
            id: u.id,
            username: u.username,
            staffId: u.staffId,
            staffName: u.staff?.staffName || u.username,
            deptId: u.deptId,
            deptName: u.department?.departmentName || '',
        }));
    }

    // ============================================================
    // 我参与的所有会话(含未读数 + 最后一条消息预览)
    // ============================================================
    async listMyConversations(currentUserId: string) {
        const myMemberships = await this.memberModel.findAll({
            where: { userId: currentUserId },
            attributes: ['conversationId', 'lastReadMessageId', 'muted', 'lastReadAt'],
        });
        if (myMemberships.length === 0) return [];

        const convIds = myMemberships.map((m) => m.conversationId);
        const myMemberMap = new Map(myMemberships.map((m) => [m.conversationId, m]));

        const conversations = await this.convModel.findAll({
            where: { id: { [Op.in]: convIds } },
            order: [['lastMessageAt', 'DESC']],
            include: [
                {
                    model: ConversationMember,
                    include: [
                        { model: User, attributes: ['id', 'username', 'staffId'], include: [{ model: Staff, attributes: ['staffName'] }] },
                    ],
                },
            ],
        });

        // 批量拉最后一条消息
        const lastMsgIds = conversations.map((c) => c.lastMessageId).filter(Boolean);
        let lastMsgMap = new Map<string, Message>();
        if (lastMsgIds.length) {
            const lastMsgs = await this.msgModel.findAll({ where: { id: { [Op.in]: lastMsgIds } } });
            lastMsgMap = new Map(lastMsgs.map((m) => [m.id, m]));
        }

        // 算未读:对每个会话,统计 senderId != currentUserId 且 id > lastReadMessageId 的消息数
        const result: any[] = [];
        for (const conv of conversations) {
            const myMember = myMemberMap.get(conv.id);
            const lastReadId = myMember?.lastReadMessageId;
            const where: any = { conversationId: conv.id, senderId: { [Op.ne]: currentUserId } };
            if (lastReadId) {
                where.id = { [Op.gt]: lastReadId };
            }
            const unread = await this.msgModel.count({ where });

            const lastMsg = conv.lastMessageId ? lastMsgMap.get(conv.lastMessageId) : null;

            // 解析展示名(direct 时取对端用户姓名,group 取群名,system 固定名)
            let displayName = conv.name;
            let displayAvatar: string | null = conv.avatar;
            if (conv.type === 'direct') {
                const other = (conv as any).members?.find((m: any) => m.userId !== currentUserId);
                displayName = other?.user?.staff?.staffName || other?.user?.username || '未知用户';
            } else if (conv.type === 'system') {
                displayName = conv.name || '系统通知';
            }

            result.push({
                id: conv.id,
                type: conv.type,
                name: displayName,
                avatar: displayAvatar,
                lastMessage: lastMsg
                    ? {
                          id: lastMsg.id,
                          type: lastMsg.type,
                          content: lastMsg.content,
                          attachmentName: lastMsg.attachmentName,
                          senderId: lastMsg.senderId,
                          createdAt: lastMsg.createdAt,
                      }
                    : null,
                lastMessageAt: conv.lastMessageAt,
                unread,
                muted: myMember?.muted || false,
                members: ((conv as any).members || []).map((m: any) => ({
                    userId: m.userId,
                    role: m.role,
                    staffName: m.user?.staff?.staffName || m.user?.username,
                    username: m.user?.username,
                })),
            });
        }
        return result;
    }

    // ============================================================
    // 单个会话详情
    // ============================================================
    async getConversationDetail(conversationId: string, currentUserId: string) {
        const conv = await this.convModel.findByPk(conversationId, {
            include: [
                {
                    model: ConversationMember,
                    include: [
                        { model: User, attributes: ['id', 'username', 'staffId'], include: [{ model: Staff, attributes: ['staffName'] }] },
                    ],
                },
            ],
        });
        if (!conv) throw new BusinessException('会话不存在');

        const isMember = (conv as any).members.some((m: any) => m.userId === currentUserId);
        if (!isMember) throw new BusinessException('您不是该会话的成员');

        const myMember = (conv as any).members.find((m: any) => m.userId === currentUserId);

        let displayName = conv.name;
        let displayAvatar: string | null = conv.avatar;
        if (conv.type === 'direct') {
            const other = (conv as any).members.find((m: any) => m.userId !== currentUserId);
            displayName = other?.user?.staff?.staffName || other?.user?.username || '未知用户';
        } else if (conv.type === 'system') {
            displayName = conv.name || '系统通知';
        }

        return {
            id: conv.id,
            type: conv.type,
            name: displayName,
            avatar: displayAvatar,
            lastMessageAt: conv.lastMessageAt,
            createdAt: conv.createdAt,
            myLastReadMessageId: myMember?.lastReadMessageId,
            members: (conv as any).members.map((m: any) => ({
                userId: m.userId,
                role: m.role,
                staffName: m.user?.staff?.staffName || m.user?.username,
                username: m.user?.username,
                joinedAt: m.joinedAt,
            })),
        };
    }

    // ============================================================
    // 创建/获取一对一会话(幂等)
    // ============================================================
    async createDirectConversation(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) {
            throw new BusinessException('不能与自己创建会话');
        }
        const target = await this.userModel.findByPk(targetUserId);
        if (!target) throw new BusinessException('目标用户不存在');

        // 找已存在的 direct 会话:同时包含这两人
        const myConvs = await this.memberModel.findAll({
            where: { userId: currentUserId },
            attributes: ['conversationId'],
        });
        const myConvIds = myConvs.map((m) => m.conversationId);

        if (myConvIds.length > 0) {
            const shared = await this.memberModel.findAll({
                where: {
                    conversationId: { [Op.in]: myConvIds },
                    userId: targetUserId,
                },
                include: [{ model: Conversation, where: { type: 'direct' } }],
            });
            if (shared.length > 0) {
                return shared[0].conversationId;
            }
        }

        // 创建新会话
        const conv = await this.convModel.create({
            type: 'direct',
            lastMessageAt: new Date(),
            createBy: currentUserId,
        } as any);

        await this.memberModel.bulkCreate([
            { conversationId: conv.id, userId: currentUserId, role: 'member' } as any,
            { conversationId: conv.id, userId: targetUserId, role: 'member' } as any,
        ]);

        // 通知对方被拉入新会话
        this.gateway.notifyConversationUpdate(targetUserId, conv.id);
        this.gateway.notifyConversationUpdate(currentUserId, conv.id);

        return conv.id;
    }

    // ============================================================
    // 创建群聊
    // ============================================================
    async createGroupConversation(currentUserId: string, name: string, memberIds: string[], avatar?: string) {
        const unique = Array.from(new Set([currentUserId, ...memberIds]));
        if (unique.length < 2) throw new BusinessException('群聊至少需要 2 个成员');

        const conv = await this.convModel.create({
            type: 'group',
            name,
            avatar: avatar || null,
            lastMessageAt: new Date(),
            createBy: currentUserId,
        } as any);

        const memberRows = unique.map((uid) => ({
            conversationId: conv.id,
            userId: uid,
            role: uid === currentUserId ? 'owner' : 'member',
        }));
        await this.memberModel.bulkCreate(memberRows as any);

        for (const uid of unique) {
            this.gateway.notifyConversationUpdate(uid, conv.id);
        }

        return conv.id;
    }

    // ============================================================
    // 拉历史消息(倒序分页)
    // ============================================================
    async getMessages(currentUserId: string, conversationId: string, pageindex: number, pagesize: number, beforeMessageId?: string) {
        // 校验成员
        const isMember = await this.memberModel.findOne({
            where: { conversationId, userId: currentUserId },
        });
        if (!isMember) throw new BusinessException('您不是该会话的成员');

        const where: any = { conversationId };
        if (beforeMessageId) {
            where.id = { [Op.lt]: beforeMessageId };
        }

        const { rows, count } = await this.msgModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            // 🌟 历史消息必须带上 sender 关联,否则前端 avatarLetter 取不到
            // staffName/username,会回退到 "我"(mine) / "?"(theirs),
            // 别人那里看自己头像就成了一个问号。
            // 因为 Message 的 BelongsTo 别名是 sender(不是默认的 user),
            // include 必须显式写 as: 'sender'。replyTo 同理。
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

        return { list: rows.reverse(), total: count, pageindex, pagesize };
    }

    // ============================================================
    // 推进已读指针
    // ============================================================
    async markRead(currentUserId: string, conversationId: string, lastReadMessageId: string) {
        const member = await this.memberModel.findOne({
            where: { conversationId, userId: currentUserId },
        });
        if (!member) throw new BusinessException('您不是该会话的成员');

        // 已读指针只能往后推
        if (member.lastReadMessageId) {
            const cur = await this.msgModel.findByPk(member.lastReadMessageId, { attributes: ['createdAt'] });
            const next = await this.msgModel.findByPk(lastReadMessageId, { attributes: ['createdAt'] });
            if (cur && next && new Date(next.createdAt) < new Date(cur.createdAt)) {
                return { ok: false, reason: 'lastReadMessageId is older than current' };
            }
        }

        member.lastReadMessageId = lastReadMessageId;
        member.lastReadAt = new Date();
        await member.save();

        // 广播已读事件
        this.gateway.broadcastRead(conversationId, {
            conversationId,
            userId: currentUserId,
            lastReadMessageId,
        });

        return { ok: true };
    }

    // ============================================================
    // 清空会话历史:删除该会话所有消息 + 已读回执,并清掉会话的 lastMessage 指针
    // 鉴权:必须是该会话成员才能清空
    // ============================================================
    async clearHistory(currentUserId: string, conversationId: string) {
        const member = await this.memberModel.findOne({
            where: { conversationId, userId: currentUserId },
        });
        if (!member) throw new BusinessException('您不是该会话的成员');

        // 先拿到消息 id 列表,用来后续删 im_message_reads(外键会级联删,但显式删更稳)
        const msgIds = await this.msgModel.findAll({
            where: { conversationId },
            attributes: ['id'],
        });
        const ids = msgIds.map((m) => m.id);

        // 删已读回执
        if (ids.length) {
            await this.readModel.destroy({ where: { messageId: ids } } as any);
        }
        // 删消息
        await this.msgModel.destroy({ where: { conversationId } } as any);

        // 重置会话的最后消息指针
        const conv = await this.convModel.findByPk(conversationId);
        if (conv) {
            (conv as any).lastMessageId = null;
            conv.lastMessageAt = new Date();
            await conv.save();
            // 重置每个成员的已读指针
            await this.memberModel.update(
                { lastReadMessageId: null, lastReadAt: null } as any,
                { where: { conversationId } } as any,
            );
        }

        // 广播 conversation:cleared,所有成员收到后清空本地消息列表
        this.gateway.broadcastConversationCleared(conversationId, {
            conversationId,
            clearedBy: currentUserId,
        });

        return { ok: true, cleared: ids.length };
    }

    // ============================================================
    // 保存消息(由 Gateway 或 Controller 调用)
    // ============================================================
    async saveMessage(opts: {
        conversationId: string;
        senderId: string | null;
        type: 'text' | 'image' | 'file' | 'system';
        content?: string;
        attachmentName?: string;
        attachmentUrl?: string;
        attachmentSize?: number;
        attachmentMime?: string;
        mentions?: string | null;
        replyToMessageId?: string | null;
    }) {
        const member = opts.senderId
            ? await this.memberModel.findOne({
                  where: { conversationId: opts.conversationId, userId: opts.senderId },
              })
            : null;
        if (opts.senderId && !member) throw new BusinessException('您不是该会话的成员');

        const msg = await this.msgModel.create({ ...opts } as any);

        // 更新会话的最后消息
        const conv = await this.convModel.findByPk(opts.conversationId);
        if (conv) {
            conv.lastMessageId = msg.id;
            conv.lastMessageAt = new Date();
            await conv.save();
        }

        // 群聊:插入已读回执(发送者自己已读)
        if (opts.senderId && conv?.type === 'group') {
            await this.readModel.create({ messageId: msg.id, userId: opts.senderId } as any);
        }

        return msg;
    }

    // ============================================================
    // 群聊重命名(仅群成员可操作)
    // ============================================================
    async renameGroupConversation(currentUserId: string, conversationId: string, newName: string) {
        const name = (newName || '').trim();
        if (!name) throw new BusinessException('群聊名称不能为空');
        if (name.length > 100) throw new BusinessException('群聊名称不能超过 100 个字符');

        const conv = await this.convModel.findByPk(conversationId);
        if (!conv) throw new BusinessException('会话不存在');
        if (conv.type !== 'group') throw new BusinessException('只能重命名群聊');

        // 鉴权:必须是群成员才能重命名
        const member = await this.memberModel.findOne({
            where: { conversationId, userId: currentUserId },
        });
        if (!member) throw new BusinessException('您不是该会话的成员');

        conv.name = name;
        await conv.save();

        // 广播会话更新:conv 房间 + 每个成员的个人房间双发,保证刚加入的群成员也能收到
        const allMembers = await this.memberModel.findAll({
            where: { conversationId },
            attributes: ['userId'],
        });
        this.gateway.broadcastConversationUpdated(
            conversationId,
            { conversationId, name, updatedBy: currentUserId },
            allMembers.map((m) => m.userId),
        );

        return { ok: true, name };
    }

    // ============================================================
    // 群聊消息已读回执
    // ============================================================
    async markGroupMessageRead(currentUserId: string, messageId: string) {
        const msg = await this.msgModel.findByPk(messageId);
        if (!msg) return { ok: false };
        const isMember = await this.memberModel.findOne({
            where: { conversationId: msg.conversationId, userId: currentUserId },
        });
        if (!isMember) return { ok: false };

        await this.readModel.findOrCreate({
            where: { messageId, userId: currentUserId },
            defaults: { messageId, userId: currentUserId } as any,
        });
        return { ok: true };
    }

    // ============================================================
    // 我加入的会话 id 列表(供 Gateway connection 时加入房间)
    // ============================================================
    async getMyConversationIds(userId: string): Promise<string[]> {
        const rows = await this.memberModel.findAll({
            where: { userId },
            attributes: ['conversationId'],
        });
        return rows.map((r) => r.conversationId);
    }

    // ============================================================
    // 校验用户是否在某会话
    // ============================================================
    async assertMember(userId: string, conversationId: string) {
        const m = await this.memberModel.findOne({ where: { userId, conversationId } });
        return !!m;
    }

    // ============================================================
    // 附件上传:从 temp 移到 public/im-uploads
    // ============================================================
    async saveAttachment(file: Express.Multer.File) {
        if (!file) throw new BusinessException('文件为空');

        const uploadDir = path.join(process.cwd(), 'public', 'im-uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 🌟 关键:busboy/multer 默认按 Latin-1 解析 multipart 里的 filename,
        // 中文文件名会出现"æ ¥ê¨"这种乱码。这里把字节流按 UTF-8 重新解码,拿到原始字符。
        const rawName = file.originalname || 'file';
        const originalName = Buffer.from(rawName, 'latin1').toString('utf8');

        // 提取 ASCII 扩展名(只允许字母数字,长度 1-8,避免奇怪扩展污染 URL)
        const extMatch = originalName.match(/\.([A-Za-z0-9]{1,8})$/);
        const ext = extMatch ? '.' + extMatch[1].toLowerCase() : '';

        // 磁盘文件名:只用 UUID + 纯 ASCII 扩展名,确保 ServeStatic 一定能命中,
        // 中文名只作为 attachmentName 字段传给前端展示,避免 URL 编码/文件系统双重坑。
        const newFilename = `${uuidv4()}${ext}`;
        const destPath = path.join(uploadDir, newFilename);

        // multer 已把文件落在 file.path
        try {
            fs.renameSync(file.path, destPath);
        } catch (e) {
            // rename 跨盘会失败,改用复制 + 删源
            fs.copyFileSync(file.path, destPath);
            fs.unlinkSync(file.path);
        }

        return {
            url: `/static/im-uploads/${newFilename}`,
            name: originalName,    // UTF-8 还原后的原始名,前端拿来显示
            size: file.size,
            mime: file.mimetype,
        };
    }
}
