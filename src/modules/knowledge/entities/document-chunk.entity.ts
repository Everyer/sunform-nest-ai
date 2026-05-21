import { Table, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { BaseModel } from '../../../common/base.entity';
import { KnowledgeDocument } from './knowledge-document.entity';

@Table({ tableName: 'document_chunks' })
export class DocumentChunk extends BaseModel {
  @ForeignKey(() => KnowledgeDocument)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    comment: '关联文档ID',
  })
  documentId: string;

  @BelongsTo(() => KnowledgeDocument)
  document: KnowledgeDocument;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '文档切片原文内容',
  })
  content: string;

  @Column({
    type: (DataTypes as any).VECTOR(1536),
    allowNull: true,
    comment: '向量数据 (1536维)',
  })
  embedding: number[];
}
