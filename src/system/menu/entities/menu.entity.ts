import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';

@Table({ tableName: 'menus' })
export class Menu extends BaseModel {

    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        comment: "父级ID"
    })
    pid: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "菜单名称",
    })
    name: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "菜单编码",
        unique: true,
    })
    code: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否用于导航栏"
    })
    isNav: boolean;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'menu',
        comment: "菜单类型" //menu为菜单，comp为组件或按钮
    })
    type: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "菜单图标"
    })
    icon: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: "菜单路由路径"
    })
    path: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "前端组件路径"
    })
    component: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "低代码编码"
    })
    lowCodeCode: string;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态" //true为启用，false为禁用
    })
    status: boolean;

    @Column({
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    })
    sort: number;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "备注信息"
    })
    remark: string;

}