import { Table, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';

@Table({ tableName: 'posts' })
export class Post extends BaseModel {


    @Column({
        allowNull: false,
        type: DataType.STRING(50),
        comment: "岗位名称",
    })
    postName: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(50),
        comment: "岗位编码",
        unique: true,
    })
    postCode: string;

    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        defaultValue: 0,
        comment: "显示顺序",
    })
    sort: number;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态" //true为启用，false为禁用
    })
    status: boolean;

    @Column({
        allowNull: true,
        type: DataType.STRING(255),
        comment: "备注信息",
    })
    remark: string;
}