import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Project } from './project.entity';
import { Page } from './page.entity';
import { DEFAULT_COMPONENT_TYPE } from '../constants/component.constants';

@Table({ tableName: 'tb_components', paranoid: true })
export class Component extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "组件名称"
    })
    componentName: string;

    @Column({
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "组件配置"
    })
    componentConfig: object;

    @Column({
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: "组件代码"
    })
    componentCode: string;

    @Column({
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: DEFAULT_COMPONENT_TYPE,
        comment: "组件类型：web-web端，mobile-移动端"
    })
    componentType: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    })
    isEnable: boolean;

    @Column({
        type: DataTypes.INTEGER,
        comment: "版本号",
        defaultValue: 100,
    })
    version: number;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "备注"
    })
    remark: string;

    @Column({
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "可操作人ID数组"
    })
    operatorIds: string[];

    @ForeignKey(() => Project)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "项目id"
    })
    projectId: string;

    @ForeignKey(() => Page)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "页面id"
    })
    pageId: string;

    @BelongsTo(() => Project)
    project: Project;

    @BelongsTo(() => Page)
    page: Page;
} 