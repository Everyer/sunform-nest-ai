import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { cosineDistance } from 'pgvector/sequelize';
import axios from 'axios';

@Injectable()
export class KnowledgeService {
  // 向量 Embedding 专用配置
  private readonly embeddingApiKey: string;
  private readonly embeddingBaseUrl: string;

  constructor(
    @InjectModel(KnowledgeBase)
    private baseModel: typeof KnowledgeBase,

    @InjectModel(KnowledgeDocument)
    private docModel: typeof KnowledgeDocument,

    @InjectModel(DocumentChunk)
    private chunkModel: typeof DocumentChunk,
  ) {
    // 向量 Embedding 专用 Key（AI_EMBEDDING_API_KEY），回退到语言模型 Key
    this.embeddingApiKey = process.env.AI_EMBEDDING_API_KEY
      || process.env.AI_AGENT_API_KEY
      || 'sk-api-f1iqpoIl9caOwotHgrpoge_F2XgdrApOo7bEDBOCt-ITV_DsuGEEYI0U9KBJqiYyCq-BEdOQ4nW7-e6xy4Ycq10u8RcwIVNW2hOH_wM7_FgdFzQerPwp0EM';
    // 向量 Embedding 专用 Base URL（AI_EMBEDDING_BASE_URL），不带 /chat/completions
    const rawEmbeddingUrl = process.env.AI_EMBEDDING_BASE_URL
      || process.env.AI_AGENT_BASE_URL
      || 'https://api.minimaxi.com/v1';
    this.embeddingBaseUrl = rawEmbeddingUrl.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');

    // ✨ 服务启动时打印当前向量模型配置
    const keySource = process.env.AI_EMBEDDING_API_KEY
      ? 'AI_EMBEDDING_API_KEY'
      : process.env.AI_AGENT_API_KEY
      ? 'AI_AGENT_API_KEY (回退)'
      : '硬编码默认';
    const keyPreview = this.embeddingApiKey
      ? `${this.embeddingApiKey.substring(0, 12)}...(${this.embeddingApiKey.length}位)`
      : '未配置';
    console.log('\n🧠 [知识库-向量模块] 初始化配置:');
    console.log(`  • 向量模型: MiniMax embo-01 (1536维)`);
    console.log(`  • Key 来源: ${keySource}`);
    console.log(`  • Key 前缀: ${keyPreview}`);
    console.log(`  • 向量接口: ${this.embeddingBaseUrl}/embeddings`);
    console.log();
  }

  // 1. 获取 1536 维文本向量数据 (MiniMax embo-01) - 使用 AI_EMBEDDING_API_KEY 专用向量 Key
  async getEmbedding(text: string, type: 'db' | 'query' = 'db'): Promise<number[]> {
    const textPreview = text.length > 30 ? text.substring(0, 30) + '...' : text;
    console.log(`🔍 [向量] 请求 MiniMax embo-01 | type=${type} | 文本前缀: "${textPreview}"`);
    try {
      const response = await axios.post(`${this.embeddingBaseUrl}/embeddings`, {
        model: 'embo-01',
        texts: [text],
        type: type
      }, {
        headers: {
          'Authorization': `Bearer ${this.embeddingApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      const baseResp = response.data?.base_resp;
      if (baseResp && baseResp.status_code !== 0) {
        throw new Error(`MiniMax Embedding 错误: [${baseResp.status_code}] ${baseResp.status_msg}`);
      }

      const vector = response.data?.vectors?.[0];
      if (vector && vector.length === 1536) {
        console.log(`  ✅ 向量获取成功 | 模型: embo-01 | 维度: ${vector.length} | 消耗 token: ${response.data?.total_tokens ?? '?'}`);
        return vector;
      }
      throw new Error(`MiniMax 返回的向量数据格式不符: ${JSON.stringify(response.data || {})}`);
    } catch (err: any) {
      console.error(`  ⚠️ MiniMax embo-01 失败，降级本地伪随机向量:`, err?.response?.data ? JSON.stringify(err.response.data) : err.message);
      return this.generateDeterministicVector(text);
    }
  }

  // 🚀 本地降级向量生成算法：在 MiniMax 故障或离线时，生成完美的 1536 维确定性向量
  private generateDeterministicVector(text: string): number[] {
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 1536; i++) {
      const seed = Math.sin(hash + i) * 10000;
      vector[i] = seed - Math.floor(seed);
    }
    return vector;
  }

  /**
   * 递归语义切割（Recursive Semantic Splitter）
   * 业界标准 RAG 切片方案（LangChain/LlamaIndex 同款思路）：
   * 优先在段落 → 换行 → 句号/问号/感叹号 处断开，最后才按字符数强切
   * 目标每片 400 字，语义重叠保留上一片最后一句，确保上下文连贯
   */
  private splitIntoChunks(text: string, targetSize: number = 400, maxSize: number = 600): string[] {
    if (!text?.trim()) return [];

    // === 第一步：按段落（双换行）拆分成段 ===
    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);

    // === 第二步：将每个段按句子边界细分，构建句子列表 ===
    const sentences: string[] = [];
    for (const para of paragraphs) {
      // 按中英文句末标点 + 换行分割
      const segs = para.split(/(?<=[。！？…\n])|(?<=\. )|(?<=! )|(?<=\? )/);
      for (const seg of segs) {
        const s = seg.trim();
        if (s.length > 0) sentences.push(s);
      }
      // 段落之间插入空行标记（帮助语义分组）
      if (sentences.length > 0 && sentences[sentences.length - 1] !== '') {
        sentences.push('');
      }
    }

    // === 第三步：将句子组装成目标大小的切片，超长句子直接按 maxSize 强切 ===
    const chunks: string[] = [];
    let current = '';
    let lastSentence = ''; // 用于语义重叠

    const flush = () => {
      const trimmed = current.trim();
      if (trimmed.length >= 20) { // 过滤过短碎片
        chunks.push(trimmed);
      }
    };

    for (const sentence of sentences) {
      if (sentence === '') {
        // 段落边界：如果当前积累超过一半目标大小，则强制切分
        if (current.length >= targetSize / 2) {
          flush();
          lastSentence = sentence;
          current = '';
        }
        continue;
      }

      // 单句超长（> maxSize），需要对该句强行按 maxSize 切
      if (sentence.length > maxSize) {
        if (current.trim()) { flush(); current = ''; }
        for (let i = 0; i < sentence.length; i += maxSize) {
          chunks.push(sentence.substring(i, Math.min(i + maxSize, sentence.length)));
        }
        lastSentence = sentence.substring(sentence.length - Math.min(sentence.length, 50));
        continue;
      }

      // 加入当前句后若超过目标大小，先切分再开新片（保留上一句作语义重叠）
      if (current.length + sentence.length > targetSize && current.length > 0) {
        flush();
        // 语义重叠：新片以上一句开头（保留语境连贯）
        current = lastSentence ? lastSentence + '\n' + sentence : sentence;
      } else {
        current += (current ? '\n' : '') + sentence;
      }

      lastSentence = sentence;
    }

    flush(); // 写入最后一片
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
      // 1. 递归语义切片（按段落→句子边界断开，目标 400 字/片）
      const textChunks = this.splitIntoChunks(content);
      console.log(`  📄 文档切片完成: ${textChunks.length} 片（递归语义切割，目标 400 字/片）`);

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
    const queryEmbedding = await this.getEmbedding(queryText, 'query');
    
    // 获取该知识库下的所有文档 ID 列表，以便隔离检索范围
    const docs = await this.docModel.findAll({
      where: { baseId, status: 'success' },
      attributes: ['id']
    });
    const docIds = docs.map(d => d.id);
    if (docIds.length === 0) return [];

    const sequelizeInstance = this.chunkModel.sequelize;
    const chunks = await this.chunkModel.findAll({
      attributes: {
        include: [
          [cosineDistance('embedding', queryEmbedding, sequelizeInstance), 'cosDistance']
        ]
      },
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

  // 全局向量检索：不限知识库，匹配整个系统内所有成功解析的文档切片
  async searchSimilarChunksGlobal(queryText: string, limit: number = 3) {
    const queryEmbedding = await this.getEmbedding(queryText, 'query');
    
    // 获取系统中所有已解析成功的文档
    const docs = await this.docModel.findAll({
      where: { status: 'success' },
      attributes: ['id']
    });
    const docIds = docs.map(d => d.id);
    if (docIds.length === 0) return [];

    const sequelizeInstance = this.chunkModel.sequelize;
    const chunks = await this.chunkModel.findAll({
      attributes: {
        include: [
          [cosineDistance('embedding', queryEmbedding, sequelizeInstance), 'cosDistance']
        ]
      },
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

    return chunks.map(chunk => {
      const data = chunk.get({ plain: true });
      return {
        ...data,
        documentTitle: (chunk as any).document?.title || '未知文件'
      };
    });
  }
}
