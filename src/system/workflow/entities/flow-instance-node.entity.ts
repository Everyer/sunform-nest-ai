import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowInstance } from './flow-instance.entity';
import { FlowTemplateNode } from './flow-template-node.entity';

@Table({ tableName: 'flow_instance_nodes' })
export class FlowInstanceNode extends BaseModel {
  @ForeignKey(() => FlowInstance)
  @Column({ type: DataType.UUID, allowNull: false, comment: '流程实例' })
  instanceId: string;

  @BelongsTo(() => FlowInstance)
  instance: FlowInstance;

  @ForeignKey(() => FlowTemplateNode)
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '对应模板节点' })
  templateNodeId: string;

  @BelongsTo(() => FlowTemplateNode)
  templateNode: FlowTemplateNode;

  @Column({ type: DataType.STRING(100), allowNull: false, comment: '节点名称（快照）' })
  nodeName: string;

  @Column({ type: DataType.STRING(30), allowNull: false, comment: '节点类型（快照）' })
  nodeType: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'pending', comment: '状态：pending/processing/approved/rejected/transferred/cancelled' })
  status: string;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '审批人' })
  assignee: string;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '审批人姓名' })
  assigneeName: string;

  @Column({ type: DataType.TEXT, allowNull: true, comment: '审批意见' })
  comment: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '附件列表' })
  attachments: any;

  @Column({ type: DataType.DATE, allowNull: true, comment: '开始处理时间' })
  startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, comment: '处理完成时间' })
  finishedAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: true, comment: '处理耗时（秒）' })
  durationSeconds: number;
}
