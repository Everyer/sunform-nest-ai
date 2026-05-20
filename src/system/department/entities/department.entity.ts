import { Table, Column, DataType as DataTypes, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
@Table({ tableName: 'departments' })
export class Department extends BaseModel {
    @HasMany(() => Staff, {
        onDelete: 'SET NULL',  // 删除部门时，将关联的员工部门ID设为 null
        onUpdate: 'CASCADE',   // 更新部门ID时，级联更新
        hooks: true
    })
    staffs: Staff[];

    @Column({
        type: DataTypes.UUID,
        allowNull: true,
        comment: "父级字典ID"
    })
    pid: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "部门名称",
    })
    departmentName: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "负责人"
    })
    leader: string;

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