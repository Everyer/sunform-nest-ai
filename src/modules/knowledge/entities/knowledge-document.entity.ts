import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base.entity';
import { KnowledgeBase } from './knowledge-base.entity';
import { DocumentChunk } from './document-chunk.entity';

@Table({ tableName: 'knowledge_documents' })
export class KnowledgeDocument extends BaseModel {
  @ForeignKey(() => KnowledgeBase)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: '所属知识库ID',
  })
  baseId: string;

  @BelongsTo(() => KnowledgeBase)
  base: KnowledgeBase;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    comment: '文档标题/文件名',
  })
  title: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: '文档类型：txt/md/pdf/docx',
  })
  type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '文件大小（字节）',
  })
  size: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'parsing',
    comment: '状态：parsing/success/failed',
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '字符总数',
  })
  charCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '切片数量',
  })
  chunkCount: number;

  @HasMany(() => DocumentChunk)
  chunks: DocumentChunk[];
}
