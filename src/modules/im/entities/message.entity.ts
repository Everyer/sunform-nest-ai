import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { User } from '../../../system/user/entities/user.entity';
import { Conversation } from './conversation.entity';
import { MessageRead } from './message-read.entity';

@Table({
    tableName: 'im_messages',
    indexes: [
        { fields: ['conversationId', 'createdAt'], name: 'im_msg_conv_created_idx' },
    ],
})
export class Message extends BaseModel {
    @ForeignKey(() => Conversation)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: '所属会话 ID',
    })
    conversationId: string;

    @BelongsTo(() => Conversation)
    conversation: Conversation;

    @ForeignKey(() => User)
    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: '发送者 ID(系统消息为 null)',
    })
    senderId: string;

    @BelongsTo(() => User)
    sender: User;

    @Column({
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'text',
        comment: '消息类型: text | image | file | system',
    })
    type: 'text' | 'image' | 'file' | 'system';

    @Column({
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '文字内容/系统消息文案',
    })
    content: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '附件展示名',
    })
    attachmentName: string;

    @Column({
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '附件访问 URL(/static/im-uploads/xxx)',
    })
    attachmentUrl: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '附件大小(字节)',
    })
    attachmentSize: number;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '附件 MIME 类型',
    })
    attachmentMime: string;

    // 🌟 @人/引用字段
    @Column({
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '@到的用户 userId 列表(JSON 数组,群聊用)',
    })
    mentions: string;

    @ForeignKey(() => Message)
    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: '引用的原消息 ID',
    })
    replyToMessageId: string;

    @BelongsTo(() => Message)
    replyTo: Message;

    @HasMany(() => MessageRead)
    reads: MessageRead[];
}
