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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const knowledge_service_1 = require("./knowledge.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../system/auth/jwt-auth.guard");
let KnowledgeController = class KnowledgeController {
    constructor(service) {
        this.service = service;
    }
    async createBase(dto) {
        return {
            success: true,
            data: await this.service.createBase(dto.name, dto.description),
        };
    }
    async listBases() {
        return {
            success: true,
            data: await this.service.listBases(),
        };
    }
    async updateBase(dto) {
        return {
            success: true,
            data: await this.service.updateBase(dto.id, dto.name, dto.description),
        };
    }
    async deleteBase(dto) {
        await this.service.deleteBase(dto.id);
        return {
            success: true,
            message: '知识库删除成功',
        };
    }
    async listDocuments(baseId) {
        return {
            success: true,
            data: await this.service.listDocuments(baseId),
        };
    }
    async uploadDocument(dto) {
        const contentText = dto.content || '';
        const sizeInBytes = Buffer.byteLength(contentText, 'utf8');
        const doc = await this.service.uploadAndParseDocument(dto.baseId, dto.title, contentText, dto.type || 'txt', sizeInBytes);
        return {
            success: true,
            data: doc,
        };
    }
    async deleteDocument(dto) {
        await this.service.deleteDocument(dto.id);
        return {
            success: true,
            message: '文档已删除',
        };
    }
    async getDocumentChunks(documentId) {
        return {
            success: true,
            data: await this.service.getDocumentChunks(documentId),
        };
    }
    async searchSimilarChunks(dto) {
        const results = await this.service.searchSimilarChunksInBase(dto.baseId, dto.queryText, dto.limit || 5);
        return {
            success: true,
            data: results,
        };
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '创建知识库' }),
    (0, common_1.Post)('base/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "createBase", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取全部知识库' }),
    (0, common_1.Get)('base/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "listBases", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '更新知识库' }),
    (0, common_1.Post)('base/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "updateBase", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '删除知识库' }),
    (0, common_1.Post)('base/delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteBase", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取知识库关联的所有文档列表' }),
    (0, common_1.Get)('document/list'),
    __param(0, (0, common_1.Query)('baseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "listDocuments", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '上传并解析新文档' }),
    (0, common_1.Post)('document/upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "uploadDocument", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '删除文档' }),
    (0, common_1.Post)('document/delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteDocument", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取文档的所有解析切片数据' }),
    (0, common_1.Get)('document/chunks'),
    __param(0, (0, common_1.Query)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getDocumentChunks", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '知识库向量相似度高保真检索' }),
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "searchSimilarChunks", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, swagger_1.ApiTags)('知识库管理'),
    (0, common_1.Controller)('knowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map