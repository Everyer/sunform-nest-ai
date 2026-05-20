"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const knowledge_base_entity_1 = require("./entities/knowledge-base.entity");
const knowledge_document_entity_1 = require("./entities/knowledge-document.entity");
const document_chunk_entity_1 = require("./entities/document-chunk.entity");
const sequelize_2 = require("pgvector/sequelize");
const axios_1 = require("axios");
let KnowledgeService = class KnowledgeService {
    constructor(baseModel, docModel, chunkModel) {
        this.baseModel = baseModel;
        this.docModel = docModel;
        this.chunkModel = chunkModel;
        this.siliconflowApiKey = process.env.SILICONFLOW_API_KEY || 'sk-rrjepjyxesmokrgnqrzjikqegxftuuqcllczhwsrpmvtsypu';
        this.siliconflowBaseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
    }
    async getEmbedding(text) {
        try {
            const response = await axios_1.default.post(`${this.siliconflowBaseUrl}/embeddings`, {
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
        }
        catch (err) {
            console.error('⚠️ BAAI/bge-large-zh-v1.5 向量模型请求失败:', err?.response?.data || err.message);
            return new Array(1024).fill(0);
        }
    }
    splitIntoChunks(text, chunkSize = 300, chunkOverlap = 50) {
        const chunks = [];
        if (!text)
            return chunks;
        let startIndex = 0;
        while (startIndex < text.length) {
            let endIndex = startIndex + chunkSize;
            if (endIndex > text.length) {
                endIndex = text.length;
            }
            chunks.push(text.substring(startIndex, endIndex));
            startIndex += (chunkSize - chunkOverlap);
            if (startIndex >= text.length || chunkSize <= chunkOverlap)
                break;
        }
        return chunks;
    }
    async createBase(name, description) {
        return this.baseModel.create({ name, description, status: 'active' });
    }
    async listBases() {
        return this.baseModel.findAll({
            include: [{
                    model: knowledge_document_entity_1.KnowledgeDocument,
                    attributes: ['id', 'size', 'status', 'charCount', 'chunkCount']
                }],
            order: [['createdAt', 'DESC']]
        });
    }
    async updateBase(id, name, description) {
        const base = await this.baseModel.findByPk(id);
        if (!base)
            throw new Error('找不到该知识库');
        return base.update({ name, description });
    }
    async deleteBase(id) {
        const base = await this.baseModel.findByPk(id);
        if (!base)
            throw new Error('找不到该知识库');
        const docs = await this.docModel.findAll({ where: { baseId: id } });
        for (const doc of docs) {
            await this.deleteDocument(doc.id);
        }
        return base.destroy();
    }
    async listDocuments(baseId) {
        return this.docModel.findAll({
            where: { baseId },
            order: [['createdAt', 'DESC']]
        });
    }
    async uploadAndParseDocument(baseId, title, content, type, size) {
        const doc = await this.docModel.create({
            baseId,
            title,
            type,
            size,
            status: 'parsing',
            charCount: content.length,
            chunkCount: 0
        });
        this.parseDocumentAsync(doc.id, content);
        return doc;
    }
    async parseDocumentAsync(docId, content) {
        const doc = await this.docModel.findByPk(docId);
        if (!doc)
            return;
        try {
            const textChunks = this.splitIntoChunks(content, 350, 50);
            doc.chunkCount = textChunks.length;
            for (const textChunk of textChunks) {
                const embedding = await this.getEmbedding(textChunk);
                await this.chunkModel.create({
                    documentId: docId,
                    content: textChunk,
                    embedding
                });
            }
            await doc.update({
                status: 'success',
                chunkCount: textChunks.length
            });
        }
        catch (err) {
            console.error(`❌ 解析文档 [${doc.title}] 失败:`, err.message);
            await doc.update({ status: 'failed' });
        }
    }
    async deleteDocument(id) {
        const doc = await this.docModel.findByPk(id);
        if (!doc)
            throw new Error('找不到该文档');
        await this.chunkModel.destroy({ where: { documentId: id } });
        return doc.destroy();
    }
    async getDocumentChunks(documentId) {
        return this.chunkModel.findAll({
            where: { documentId },
            order: [['createdAt', 'ASC']]
        });
    }
    async searchSimilarChunksInBase(baseId, queryText, limit = 5) {
        const queryEmbedding = await this.getEmbedding(queryText);
        const docs = await this.docModel.findAll({
            where: { baseId, status: 'success' },
            attributes: ['id']
        });
        const docIds = docs.map(d => d.id);
        if (docIds.length === 0)
            return [];
        const sequelizeInstance = this.chunkModel.sequelize;
        const chunks = await this.chunkModel.findAll({
            where: {
                documentId: docIds
            },
            include: [{
                    model: knowledge_document_entity_1.KnowledgeDocument,
                    attributes: ['title']
                }],
            order: (0, sequelize_2.cosineDistance)('embedding', queryEmbedding, sequelizeInstance),
            limit
        });
        return chunks.map(chunk => {
            const data = chunk.get({ plain: true });
            return {
                ...data,
                documentTitle: chunk.document?.title || '未知文件'
            };
        });
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(knowledge_base_entity_1.KnowledgeBase)),
    __param(1, (0, sequelize_1.InjectModel)(knowledge_document_entity_1.KnowledgeDocument)),
    __param(2, (0, sequelize_1.InjectModel)(document_chunk_entity_1.DocumentChunk)),
    __metadata("design:paramtypes", [Object, Object, Object])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map