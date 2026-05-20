import { Table, Column, DataType, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowTemplateNode } from './flow-template-node.entity';
import { FlowTemplateEdge } from './flow-template-edge.entity';
import { FlowFormDef } from './flow-form-def.entity';
import { FlowNodePermission } from './flow-node-permission.entity';

@Table({ tableName: 'flow_templates' })
export class FlowTemplate extends BaseModel {
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '流程名称' })
  name: string;

  @Column({ type: DataType.STRING(50), unique: true, allowNull: false, comment: '流程编码' })
  code: string;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '分类：行政/财务/人事/其他' })
  category: string;

  @Column({ type: DataType.TEXT, allowNull: true, comment: '流程说明' })
  description: string;

  @ForeignKey(() => FlowFormDef)
  @Column({ type: DataType.UUID, allowNull: true, comment: '关联表单定义' })
  formDefId: string;

  @BelongsTo(() => FlowFormDef)
  formDef: FlowFormDef;

  @Column({ type: DataType.SMALLINT, defaultValue: 0, comment: '0=草稿 1=已发布 2=已停用' })
  status: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1, comment: '版本号' })
  version: number;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '扩展配置' })
  config: any;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '创建人' })
  createdBy: string;

  @HasMany(() => FlowTemplateNode)
  nodes: FlowTemplateNode[];

  @HasMany(() => FlowTemplateEdge)
  edges: FlowTemplateEdge[];

  @HasMany(() => FlowNodePermission)
  nodePermissions: FlowNodePermission[];
}
