import { Table, Column, DataType as DataTypes, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { UserSurvey } from '../../user-survey/entities/user-survey.entity';
import { Dict } from '../../../system/dict/entities/dict.entity';
@Table({ tableName: 'onboardings' })
export class Onboarding extends BaseHasUserModel {
    @ForeignKey(() => UserSurvey)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "台账信息ID"
    })
    userSurveyId: string;

    @BelongsTo(() => UserSurvey)
    userSurvey: UserSurvey;

    @Column({
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "入职日期"
    })
    onboardingDate: Date;

    @Column({
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "联系电话"
    })
    mobile: string;

    @ForeignKey(() => Staff)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "人资对接人ID"
    })
    hrStaffId: string;

    @BelongsTo(() => Staff, 'hrStaffId')
    hrStaff: Staff;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "信息来源"
    })
    source: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "入职地点"
    })
    location: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "租赁状态"
    })
    rentalStatus: string;


    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "租金＋电池"
    })
    rentWithBattery: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "租金＋车"
    })
    rentWithVehicle: string;

    @ForeignKey(() => Staff)
    @Column({
        type: DataTypes.UUID,
        allowNull: false,
        comment: "租车对接人ID"
    })
    rentalStaffId: string;

    @BelongsTo(() => Staff, 'rentalStaffId')
    rentalStaff: Staff;

    @Column({
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "是否办电话卡"
    })
    hasPhoneCard: boolean;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "收款方式"
    })
    paymentMethod: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "备注"
    })
    remark: string;
}