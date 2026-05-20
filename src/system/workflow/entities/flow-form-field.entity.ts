import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowFormDef } from './flow-form-def.entity';

@Table({ tableName: 'flow_form_fields' })
export class FlowFormField extends BaseModel {
  @ForeignKey(() => FlowFormDef)
  @Column({ type: DataType.UUID, allowNull: false, comment: '所属表单定义' })
  formDefId: string;

  @BelongsTo(() => FlowFormDef)
  formDef: FlowFormDef;

  @Column({ type: DataType.STRING(50), allowNull: false, comment: '字段标识' })
  fieldKey: string;

  @Column({ type: DataType.STRING(100), allowNull: false, comment: '字段显示名' })
  fieldLabel: string;

  @Column({ type: DataType.STRING(30), allowNull: false, comment: '字段类型' })
  fieldType: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '选项列表' })
  options: any;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '默认值' })
  defaultValue: any;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, comment: '是否必填' })
  required: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 0, comment: '排序' })
  sortOrder: number;
}
