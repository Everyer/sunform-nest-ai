import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';

@Table({ tableName: 'dicts' })
export class Dict extends BaseModel {

    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        comment: "父级字典ID"
    })
    pid: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "字典名称"
    })
    label: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "字典编码",
        unique: true
    })
    value: string;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "字典状态" //true为启用，false为禁用
    })
    status: boolean;

    @Column({
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "字典排序"
    })
    sort: number;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "备注信息"
    })
    remark: string;
}