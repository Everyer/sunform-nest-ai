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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentChunk = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const base_entity_1 = require("../../../common/base.entity");
const knowledge_document_entity_1 = require("./knowledge-document.entity");
let DocumentChunk = class DocumentChunk extends base_entity_1.BaseModel {
};
exports.DocumentChunk = DocumentChunk;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => knowledge_document_entity_1.KnowledgeDocument),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: '关联文档ID',
    }),
    __metadata("design:type", String)
], DocumentChunk.prototype, "documentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => knowledge_document_entity_1.KnowledgeDocument),
    __metadata("design:type", knowledge_document_entity_1.KnowledgeDocument)
], DocumentChunk.prototype, "document", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '文档切片原文内容',
    }),
    __metadata("design:type", String)
], DocumentChunk.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.VECTOR(1024),
        allowNull: true,
        comment: '向量数据 (1024维)',
    }),
    __metadata("design:type", Array)
], DocumentChunk.prototype, "embedding", void 0);
exports.DocumentChunk = DocumentChunk = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'document_chunks' })
], DocumentChunk);
//# sourceMappingURL=document-chunk.entity.js.map