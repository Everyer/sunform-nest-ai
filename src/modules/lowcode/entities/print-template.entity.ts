import { Table, Column, DataType as DataTypes } from 'sequelize-typescript';
import { BaseHasUserModel } from '../../../common/base.hasuser.entity';

@Table({ tableName: 'tb_print_template', paranoid: true })
export class PrintTemplate extends BaseHasUserModel {
    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "模板唯一标识 ID"
    })
    templateId: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "模板名称"
    })
    templateName: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "关联的数据详情接口"
    })
    apiPath: string;

    @Column({
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'A4',
        comment: "纸张预设"
    })
    paperSizePreset: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 210,
        comment: "纸张物理宽 (mm)"
    })
    paperWidth: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 297,
        comment: "纸张物理高 (mm)"
    })
    paperHeight: number;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: "是否横向"
    })
    isLandscape: boolean;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        comment: "网格步长 (mm)"
    })
    gridSize: number;

    @Column({
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "页面四边距配置 (JSON 字符串)"
    })
    pageMargins: string;

    @Column({
        type: DataTypes.TEXT('long'),
        allowNull: false,
        comment: "设计器元素 JSON Payload"
    })
    elementsJson: string;

    @Column({
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "项目/应用分类标识，用于开放给不同项目"
    })
    appId: string;

    @Column({
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "备注信息"
    })
    remark: string;
}
