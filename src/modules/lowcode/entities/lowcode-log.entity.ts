import { Table, Column, DataType as DataTypes, Model } from 'sequelize-typescript';
import * as moment from 'moment';

@Table({ tableName: 'tb_lowcode_log', paranoid: false })
export class LowcodeLog extends Model {
    @Column({
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        comment: "唯一主键"
    })
    id: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "低代码配置代码"
    })
    componentCode: string;

    @Column({
        type: DataTypes.JSONB,
        allowNull: false,
        comment: "组件配置"
    })
    componentConfig: object;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "组件名称"
    })
    componentName: string;

    @Column({
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "备注"
    })
    remark: string;

    @Column({
        type: DataTypes.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    })
    createdAt: Date;

    @Column({
        type: DataTypes.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    })
    updatedAt: Date;
} 