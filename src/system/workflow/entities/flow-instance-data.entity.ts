import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowInstance } from './flow-instance.entity';
import { FlowInstanceNode } from './flow-instance-node.entity';

@Table({ tableName: 'flow_instance_data' })
export class FlowInstanceData extends BaseModel {
  @ForeignKey(() => FlowInstance)
  @Column({ type: DataType.UUID, allowNull: false, comment: '流程实例' })
  instanceId: string;

  @BelongsTo(() => FlowInstance)
  instance: FlowInstance;

  @ForeignKey(() => FlowInstanceNode)
  @Column({ type: DataType.UUID, allowNull: true, comment: '节点（每节点一条记录）' })
  nodeId: string;

  @BelongsTo(() => FlowInstanceNode)
  node: FlowInstanceNode;

  @Column({ type: DataType.JSONB, allowNull: false, comment: '表单字段值' })
  data: any;

  @Column({ type: DataType.INTEGER, defaultValue: 1, comment: '数据版本号' })
  dataVersion: number;
}
