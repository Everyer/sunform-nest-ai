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
exports.KnowledgeDocument = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const knowledge_base_entity_1 = require("./knowledge-base.entity");
const document_chunk_entity_1 = require("./document-chunk.entity");
let KnowledgeDocument = class KnowledgeDocument extends base_entity_1.BaseModel {
};
exports.KnowledgeDocument = KnowledgeDocument;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => knowledge_base_entity_1.KnowledgeBase),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: '所属知识库ID',
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "baseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => knowledge_base_entity_1.KnowledgeBase),
    __metadata("design:type", knowledge_base_entity_1.KnowledgeBase)
], KnowledgeDocument.prototype, "base", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: false,
        comment: '文档标题/文件名',
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(30),
        allowNull: false,
        comment: '文档类型：txt/md/pdf/docx',
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        comment: '文件大小（字节）',
    }),
    __metadata("design:type", Number)
], KnowledgeDocument.prototype, "size", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        defaultValue: 'parsing',
        comment: '状态：parsing/success/failed',
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: '字符总数',
    }),
    __metadata("design:type", Number)
], KnowledgeDocument.prototype, "charCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: '切片数量',
    }),
    __metadata("design:type", Number)
], KnowledgeDocument.prototype, "chunkCount", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => document_chunk_entity_1.DocumentChunk),
    __metadata("design:type", Array)
], KnowledgeDocument.prototype, "chunks", void 0);
exports.KnowledgeDocument = KnowledgeDocument = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'knowledge_documents' })
], KnowledgeDocument);
//# sourceMappingURL=knowledge-document.entity.js.map