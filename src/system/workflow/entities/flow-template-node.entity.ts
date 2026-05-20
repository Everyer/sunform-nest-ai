import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateEdge } from './flow-template-edge.entity';
import { FlowNodePermission } from './flow-node-permission.entity';

@Table({ tableName: 'flow_template_nodes' })
export class FlowTemplateNode extends BaseModel {
  @Column({
    type: DataType.STRING(100),
    primaryKey: true,
    allowNull: false,
    comment: '唯一主键'
  })
  id: string;

  @ForeignKey(() => FlowTemplate)
  @Column({ type: DataType.UUID, allowNull: false, comment: '所属模板' })
  templateId: string;

  @BelongsTo(() => FlowTemplate)
  template: FlowTemplate;

  @Column({ type: DataType.STRING(100), allowNull: false, comment: '节点名称' })
  name: string;

  @Column({ type: DataType.STRING(30), allowNull: false, comment: '节点类型：start/approve/condition/end' })
  type: string;

  @Column({ type: DataType.STRING(30), allowNull: true, comment: '审批人类型：specified_user/specified_role/superior/superior_level/custom' })
  assigneeType: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '审批人配置值' })
  assigneeValue: any;

  @Column({ type: DataType.FLOAT, allowNull: true, comment: '画布X坐标' })
  positionX: number;

  @Column({ type: DataType.FLOAT, allowNull: true, comment: '画布Y坐标' })
  positionY: number;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '节点配置（会签/或签、超时等）' })
  config: any;

  @Column({ type: DataType.INTEGER, defaultValue: 0, comment: '排序' })
  order: number;

  @HasMany(() => FlowTemplateEdge, { foreignKey: 'sourceNodeId' })
  outgoingEdges: FlowTemplateEdge[];

  @HasMany(() => FlowTemplateEdge, { foreignKey: 'targetNodeId' })
  incomingEdges: FlowTemplateEdge[];

  @HasMany(() => FlowNodePermission)
  fieldPermissions: FlowNodePermission[];
}
