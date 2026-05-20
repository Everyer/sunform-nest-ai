import { Table, Column, DataType as DataTypes, BelongsTo, ForeignKey, BelongsToMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Department } from '../../department/entities/department.entity';
import { Role } from '../../role/entities/role.entity';
import { UserRole } from './user-role.entity';
@Table({ tableName: 'users' })
export class User extends BaseModel {

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "用户名"
    })
    username: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "密码"
    })
    password: string;

    @ForeignKey(() => Staff)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "员工ID"
    })
    staffId: string;

    @BelongsTo(() => Staff)
    staff: Staff;

    @ForeignKey(() => Department)
    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        onUpdate: 'CASCADE',  // 级联更新
        onDelete: 'SET NULL',  // 删除时设为 null
        comment: "部门ID"
    })
    deptId: string;

    @BelongsTo(() => Department)
    department: Department;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "数据权限"
    })
    dataScope: string;

    @Column({
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    })
    sort: number;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态" //true为启用，false为禁用
    })
    status: boolean;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "备注信息"
    })
    remark: string;

    @BelongsToMany(() => Role, {
        through: () => UserRole,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    roles: Role[];
}