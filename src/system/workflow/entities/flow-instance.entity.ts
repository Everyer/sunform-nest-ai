import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowFormDef } from './flow-form-def.entity';
import { FlowInstanceNode } from './flow-instance-node.entity';
import { FlowInstanceData } from './flow-instance-data.entity';

@Table({ tableName: 'flow_instances' })
export class FlowInstance extends BaseModel {
  @ForeignKey(() => FlowTemplate)
  @Column({ type: DataType.UUID, allowNull: false, comment: '流程模板' })
  templateId: string;

  @BelongsTo(() => FlowTemplate)
  template: FlowTemplate;

  @Column({ type: DataType.INTEGER, allowNull: true, comment: '发起时模板版本号' })
  templateVersion: number;

  @ForeignKey(() => FlowFormDef)
  @Column({ type: DataType.UUID, allowNull: true, comment: '表单定义' })
  formDefId: string;

  @BelongsTo(() => FlowFormDef)
  formDef: FlowFormDef;

  @Column({ type: DataType.STRING(200), allowNull: true, comment: '实例标题' })
  title: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'draft', comment: '状态：draft/running/approved/rejected/cancelled' })
  status: string;

  @Column({ type: DataType.STRING(50), allowNull: false, comment: '发起人' })
  initiator: string;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '发起人部门' })
  initiatorDept: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '当前活跃节点ID数组' })
  currentNodeIds: string[];

  @Column({ type: DataType.SMALLINT, defaultValue: 0, comment: '优先级：0=普通 1=紧急 2=特急' })
  priority: number;

  @Column({ type: DataType.DATE, allowNull: true, comment: '截止日期' })
  dueDate: Date;

  @Column({ type: DataType.DATE, allowNull: true, comment: '完成时间' })
  finishedAt: Date;

  @HasMany(() => FlowInstanceNode)
  nodes: FlowInstanceNode[];

  @HasMany(() => FlowInstanceData)
  dataSnapshots: FlowInstanceData[];
}
