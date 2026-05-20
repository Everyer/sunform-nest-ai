import { Table, Column, DataType as DataTypes, BelongsToMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { Menu } from '../../menu/entities/menu.entity';
import { Department } from '../../department/entities/department.entity';
import { RoleMenu } from './role-menu.entity';
import { RoleDepartment } from './role-department.entity';

@Table({ tableName: 'roles' })
export class Role extends BaseModel {
    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "角色名称"
    })
    roleName: string;

    @Column({
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "角色权限字符"
    })
    roleKey: any;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "数据权限" //本人-0，本部门及以下-1，本部门-2，自定义-3，全部-4
    })
    dataScope: string;

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

    @BelongsToMany(() => Menu, {
        through: () => RoleMenu,
        onDelete: 'CASCADE',  // 当菜单被删除时，自动删除关联记录
        onUpdate: 'CASCADE'   // 当菜单ID更新时，自动更新关联记录
    })
    menus: Menu[];

    @BelongsToMany(() => Department, {
        through: () => RoleDepartment,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    departments: Department[];
}