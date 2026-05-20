import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { KnowledgeDocument } from './knowledge-document.entity';

@Table({ tableName: 'knowledge_bases' })
export class KnowledgeBase extends BaseModel {
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    comment: '知识库名称',
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '知识库描述',
  })
  description: string;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active',
    comment: '状态：active/inactive',
  })
  status: string;

  @HasMany(() => KnowledgeDocument)
  documents: KnowledgeDocument[];
}
