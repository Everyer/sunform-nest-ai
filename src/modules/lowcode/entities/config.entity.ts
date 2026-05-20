import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';

@Table({ tableName: 'tb_lowcode_config', paranoid: true })
export class LowcodeConfig extends BaseModel {
    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "用户ID"
    })
    userid: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "基础地址"
    })
    baseUrl: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Token键名"
    })
    tokenKey: string;

    @Column({
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Token值"
    })
    tokenValue: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "主机地址"
    })
    host: string;
} 