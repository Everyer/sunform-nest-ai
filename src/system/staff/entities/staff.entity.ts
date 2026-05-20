import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { Department } from '../../department/entities/department.entity';
import { Post } from '../../post/entities/post.entity';
@Table({ tableName: 'staffs' })
export class Staff extends BaseModel {
    @ForeignKey(() => Department)
    @Column({
        type: DataTypes.UUID,
        allowNull: true,  // 改为允许为空
        comment: "部门ID",
        onUpdate: 'CASCADE',  // 级联更新
        onDelete: 'SET NULL'  // 删除时设为 null
    })
    deptId: string;

    @BelongsTo(() => Department)
    department: Department;

    @ForeignKey(() => Post)
    @Column({
        type: DataTypes.UUID,
        allowNull: true,  // 改为允许为空
        comment: "岗位ID",
        onUpdate: 'CASCADE',  // 级联更新
        onDelete: 'SET NULL'  // 删除时设为 null
    })
    postId: string;

    @BelongsTo(() => Post)
    post: Post;


    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "员工姓名",
    })
    staffName: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "员工编号",
        unique: true,
    })
    staffCode: string;

    @Column({
        type: DataTypes.STRING(11),
        allowNull: false,
        comment: "手机号码"
    })
    mobile: string;

    @Column({
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: "1",
        comment: "性别" //1为男，0为女
    })
    gender: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "邮箱"
    })
    email: string;

    @Column({
        type: DataTypes.STRING(18),
        allowNull: false,
        comment: "身份证"
    })
    idCard: string;

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