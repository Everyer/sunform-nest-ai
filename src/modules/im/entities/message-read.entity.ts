import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { User } from '../../../system/user/entities/user.entity';
import { Message } from './message.entity';

@Table({
    tableName: 'im_message_reads',
    indexes: [
        {
            unique: true,
            fields: ['messageId', 'userId'],
            name: 'im_msg_read_unique',
        },
    ],
})
export class MessageRead extends BaseModel {
    @ForeignKey(() => Message)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: '消息 ID',
    })
    messageId: string;

    @BelongsTo(() => Message)
    message: Message;

    @ForeignKey(() => User)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: '已读用户 ID',
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '已读时间',
    })
    readAt: Date;
}
