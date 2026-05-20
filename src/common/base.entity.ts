import { Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import * as moment from 'moment';
// import { User } from "../system/user/entities/user.entity";
export class BaseModel extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
        primaryKey: true,
        comment: "唯一主键"
    })
    id: string;
    @Column({
        type: DataType.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    })
    createdAt: Date;

    @Column({
        type: DataType.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    })
    updatedAt: Date;

    // @ForeignKey(() => User)
    // @ForeignKey(() => require('../system/user/entities/user.entity').User)
    // @Column({
    //     type: DataType.UUID,
    //     allowNull: true,
    //     comment: "创建人"
    // })
    // createBy: string;

    // @BelongsTo(() => User)
    // @BelongsTo(() => require('../system/user/entities/user.entity').User)
    // creator: User;
}
