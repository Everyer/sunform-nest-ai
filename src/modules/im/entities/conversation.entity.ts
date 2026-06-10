import { Table, Column, DataType as DataTypes, HasMany } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { ConversationMember } from './conversation-member.entity';
import { Message } from './message.entity';

@Table({ tableName: 'im_conversations' })
export class Conversation extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'direct',
        comment: '会话类型: direct(一对一) | group(群聊) | system(系统消息)',
    })
    type: 'direct' | 'group' | 'system';

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '群聊名称(direct/system 可为空)',
    })
    name: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '群头像 URL',
    })
    avatar: string;

    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        comment: '最后一条消息 ID(冗余,便于排序展示)',
    })
    lastMessageId: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '最后活跃时间(主排序键)',
    })
    lastMessageAt: Date;

    @HasMany(() => ConversationMember)
    members: ConversationMember[];

    @HasMany(() => Message)
    messages: Message[];
}
