import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';

@Table({ tableName: 'usersurveys' })
export class UserSurvey extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "姓名"
    })
    name: string;

    @Column({
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: "1",
        comment: "性别"
    })
    gender: string;

    @Column({
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "年龄"
    })
    age: string;

    @Column({
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "手机号码"
    })
    mobile: string;


    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "目前在哪个城市"
    })
    address: string;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "岗位意向"
    })
    postIntention: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "是否需要提供住宿"
    })
    needAccommodation: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "是否需要提供食宿及交通补贴"
    })
    needAccommodationAndTransportation: boolean;

    @Column({
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "备注"
    })
    remark: string;
}