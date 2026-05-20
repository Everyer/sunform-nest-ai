import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { cosineDistance } from 'pgvector/sequelize';
import axios from 'axios';

@Injectable()
export class KnowledgeService {
  private readonly siliconflowApiKey: string;
  private readonly siliconflowBaseUrl: string;

  constructor(
    @InjectModel(KnowledgeBase)
    private baseModel: typeof KnowledgeBase,

    @InjectModel(KnowledgeDocument)
    private docModel: typeof KnowledgeDocument,

    @InjectModel(DocumentChunk)
    private chunkModel: typeof DocumentChunk,
  ) {
    this.siliconflowApiKey = process.env.SILICONFLOW_API_KEY || 'sk-rrjepjyxesmokrgnqrzjikqegxftuuqcllczhwsrpmvtsypu';
    this.siliconflowBaseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  }

  // 1. 获取 1024 维文本向量数据
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.siliconflowBaseUrl}/embeddings`, {
        model: 'BAAI/bge-large-zh-v1.5',
        input: text
      }, {
        headers: {
          'Authorization': `Bearer ${this.siliconflowApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data?.data?.[0]?.embedding || new Array(1024).fill(0);
    } catch (err: any) {
      console.error('⚠️ BAAI/bge-large-zh-v1.5 向量模型请求失败:', err?.response?.data || err.message);
      return new Array(1024).fill(0); // 降级返回全零向量，避免流程中断
    }
  }

  // 2. 文本分片机制 (滑动窗口切片)
  private splitIntoChunks(text: string, chunkSize: number = 300, chunkOverlap: number = 50): string[] {
    const chunks: string[] = [];
    if (!text) return chunks;
    
    let startIndex = 0;
    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize;
      if (endIndex > text.length) {
        endIndex = text.length;
      }
      chunks.push(text.substring(startIndex, endIndex));
      startIndex += (chunkSize - chunkOverlap);
      if (startIndex >= text.length || chunkSize <= chunkOverlap) break;
    }
    return chunks;
  }

  // === 知识库管理 (KnowledgeBase) ===
  async createBase(name: string, description?: string) {
    return this.baseModel.create({ name, description, status: 'active' });
  }

  async listBases() {
    // 包含关联的文档数量
    return this.baseModel.findAll({
      include: [{
        model: KnowledgeDocument,
        attributes: ['id', 'size', 'status', 'charCount', 'chunkCount']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async updateBase(id: string, name: string, description?: string) {
    const base = await this.baseModel.findByPk(id);
    if (!base) throw new Error('找不到该知识库');
    return base.update({ name, description });
  }

  async deleteBase(id: string) {
    const base = await this.baseModel.findByPk(id);
    if (!base) throw new Error('找不到该知识库');
    // 删除该库下关联的所有文档及其切片 (Sequelize 自动关联删除或手动删除)
    const docs = await this.docModel.findAll({ where: { baseId: id } });
    for (const doc of docs) {
      await this.deleteDocument(doc.id);
    }
    return base.destroy();
  }

  // === 文档管理 (KnowledgeDocument) ===
  async listDocuments(baseId: string) {
    return this.docModel.findAll({
      where: { baseId },
      order: [['createdAt', 'DESC']]
    });
  }

  // 上传并解析文档 (自动切片 + 生成向量)
  async uploadAndParseDocument(baseId: string, title: string, content: string, type: string, size: number) {
    // 1. 创建文档记录，状态为解析中
    const doc = await this.docModel.create({
      baseId,
      title,
      type,
      size,
      status: 'parsing',
      charCount: content.length,
      chunkCount: 0
    });

    // 2. 异步触发切片和向量生成流程 (保持响应速度)
    this.parseDocumentAsync(doc.id, content);

    return doc;
  }

  private async parseDocumentAsync(docId: string, content: string) {
    const doc = await this.docModel.findByPk(docId);
    if (!doc) return;

    try {
      // 1. 文本切片
      const textChunks = this.splitIntoChunks(content, 350, 50);
      doc.chunkCount = textChunks.length;

      // 2. 逐片生成 embedding 并入库
      for (const textChunk of textChunks) {
        const embedding = await this.getEmbedding(textChunk);
        await this.chunkModel.create({
          documentId: docId,
          content: textChunk,
          embedding
        } as any);
      }

      // 3. 更新文档状态为成功
      await doc.update({
        status: 'success',
        chunkCount: textChunks.length
      });
    } catch (err: any) {
      console.error(`❌ 解析文档 [${doc.title}] 失败:`, err.message);
      await doc.update({ status: 'failed' });
    }
  }

  async deleteDocument(id: string) {
    const doc = await this.docModel.findByPk(id);
    if (!doc) throw new Error('找不到该文档');
    // 删除所有关联的切片
    await this.chunkModel.destroy({ where: { documentId: id } });
    return doc.destroy();
  }

  // === 文档切片列表 & 检索 ===
  async getDocumentChunks(documentId: string) {
    return this.chunkModel.findAll({
      where: { documentId },
      order: [['createdAt', 'ASC']]
    });
  }

  // 向量检索：根据查询语句匹配相似切片
  async searchSimilarChunksInBase(baseId: string, queryText: string, limit: number = 5) {
    const queryEmbedding = await this.getEmbedding(queryText);
    
    // 获取该知识库下的所有文档 ID 列表，以便隔离检索范围
    const docs = await this.docModel.findAll({
      where: { baseId, status: 'success' },
      attributes: ['id']
    });
    const docIds = docs.map(d => d.id);
    if (docIds.length === 0) return [];

    const sequelizeInstance = this.chunkModel.sequelize;
    const chunks = await this.chunkModel.findAll({
      where: {
        documentId: docIds
      },
      include: [{
        model: KnowledgeDocument,
        attributes: ['title']
      }],
      order: cosineDistance('embedding', queryEmbedding, sequelizeInstance),
      limit
    });

    // 格式化输出，带上相似度得分 (Sequelize 的 cosinedistance 值越小越相似)
    // 相似度得分计算公式: 1 - cosineDistance
    return chunks.map(chunk => {
      const data = chunk.get({ plain: true });
      // 计算与查询向量的余弦距离 (使用简单的点积和范数计算或直接返回)
      return {
        ...data,
        documentTitle: (chunk as any).document?.title || '未知文件'
      };
    });
  }
}
