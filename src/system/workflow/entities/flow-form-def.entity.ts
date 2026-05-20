import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowFormField } from './flow-form-field.entity';

@Table({ tableName: 'flow_form_defs' })
export class FlowFormDef extends BaseModel {
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '表单名称' })
  name: string;

  @Column({ type: DataType.STRING(50), unique: true, allowNull: false, comment: '表单编码' })
  code: string;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '关联 Sunform 页面 ID' })
  sunformPageId: string;

  @Column({ type: DataType.TEXT, allowNull: true, comment: '表单描述' })
  description: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '扩展配置' })
  config: any;

  @HasMany(() => FlowFormField)
  fields: FlowFormField[];
}
