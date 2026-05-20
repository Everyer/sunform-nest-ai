import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Project } from './project.entity';

@Table({ tableName: 'tb_page', paranoid: true })
export class Page extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "页面名称"
    })
    pageName: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    })
    isEnable: boolean;

    @ForeignKey(() => Project)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "项目id"
    })
    projectId: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "备注"
    })
    remark: string;

    @BelongsTo(() => Project)
    project: Project;
} 