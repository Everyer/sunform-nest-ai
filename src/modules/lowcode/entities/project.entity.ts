import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';

@Table({ tableName: 'tb_project', paranoid: true })
export class Project extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "项目名称"
    })
    projectName: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    })
    isEnable: boolean;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "备注"
    })
    remark: string;
} 