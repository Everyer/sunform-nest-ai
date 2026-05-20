import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { FlowTemplate } from './flow-template.entity';
import { FlowTemplateNode } from './flow-template-node.entity';

@Table({ tableName: 'flow_node_permissions' })
export class FlowNodePermission extends BaseModel {
  @ForeignKey(() => FlowTemplate)
  @Column({ type: DataType.UUID, allowNull: false, comment: '流程模板' })
  templateId: string;

  @BelongsTo(() => FlowTemplate)
  template: FlowTemplate;

  @ForeignKey(() => FlowTemplateNode)
  @Column({ type: DataType.STRING(100), allowNull: false, comment: '模板节点' })
  nodeId: string;

  @BelongsTo(() => FlowTemplateNode)
  node: FlowTemplateNode;

  @Column({ type: DataType.STRING(50), allowNull: false, comment: '字段标识' })
  fieldKey: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'readonly', comment: '权限：editable/readonly/hidden' })
  permission: string;
}
