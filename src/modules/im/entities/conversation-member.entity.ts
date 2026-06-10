import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { User } from '../../../system/user/entities/user.entity';
import { Conversation } from './conversation.entity';

@Table({
    tableName: 'im_conversation_members',
    indexes: [
        {
            unique: true,
            fields: ['conversationId', 'userId'],
            name: 'im_member_conv_user_unique',
        },
    ],
})
export class ConversationMember extends BaseModel {
    @ForeignKey(() => Conversation)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: '会话 ID',
    })
    conversationId: string;

    @BelongsTo(() => Conversation)
    conversation: Conversation;

    @ForeignKey(() => User)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: '成员用户 ID',
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'member',
        comment: '角色: owner | admin | member',
    })
    role: 'owner' | 'admin' | 'member';

    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        comment: '该用户在此会话已读到的最后消息 ID',
    })
    lastReadMessageId: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后已读时间',
    })
    lastReadAt: Date;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否静音',
    })
    muted: boolean;

    @Column({
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '加入时间',
    })
    joinedAt: Date;
}
