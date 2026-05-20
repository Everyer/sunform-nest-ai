import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateNode } from './flow-template-node.entity';

@Table({ tableName: 'flow_template_edges' })
export class FlowTemplateEdge extends BaseModel {
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

  @ForeignKey(() => FlowTemplateNode)
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '起始节点' })
  sourceNodeId: string;

  @BelongsTo(() => FlowTemplateNode, { foreignKey: 'sourceNodeId' })
  sourceNode: FlowTemplateNode;

  @ForeignKey(() => FlowTemplateNode)
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '目标节点' })
  targetNodeId: string;

  @BelongsTo(() => FlowTemplateNode, { foreignKey: 'targetNodeId' })
  targetNode: FlowTemplateNode;

  @Column({ type: DataType.STRING(50), allowNull: true, comment: '连线标签' })
  label: string;

  @Column({ type: DataType.JSONB, allowNull: true, comment: '条件表达式' })
  condition: any;

  @Column({ type: DataType.INTEGER, defaultValue: 0, comment: '排序' })
  order: number;
}
