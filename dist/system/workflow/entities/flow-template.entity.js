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
exports.FlowTemplate = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_template_node_entity_1 = require("./flow-template-node.entity");
const flow_template_edge_entity_1 = require("./flow-template-edge.entity");
const flow_form_def_entity_1 = require("./flow-form-def.entity");
const flow_node_permission_entity_1 = require("./flow-node-permission.entity");
let FlowTemplate = class FlowTemplate extends base_entity_1.BaseModel {
};
exports.FlowTemplate = FlowTemplate;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '流程名称' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), unique: true, allowNull: false, comment: '流程编码' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '分类：行政/财务/人事/其他' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true, comment: '流程说明' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_form_def_entity_1.FlowFormDef),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true, comment: '关联表单定义' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "formDefId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_form_def_entity_1.FlowFormDef),
    __metadata("design:type", flow_form_def_entity_1.FlowFormDef)
], FlowTemplate.prototype, "formDef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, defaultValue: 0, comment: '0=草稿 1=已发布 2=已停用' }),
    __metadata("design:type", Number)
], FlowTemplate.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1, comment: '版本号' }),
    __metadata("design:type", Number)
], FlowTemplate.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '扩展配置' }),
    __metadata("design:type", Object)
], FlowTemplate.prototype, "config", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '创建人' }),
    __metadata("design:type", String)
], FlowTemplate.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_template_node_entity_1.FlowTemplateNode),
    __metadata("design:type", Array)
], FlowTemplate.prototype, "nodes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_template_edge_entity_1.FlowTemplateEdge),
    __metadata("design:type", Array)
], FlowTemplate.prototype, "edges", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_node_permission_entity_1.FlowNodePermission),
    __metadata("design:type", Array)
], FlowTemplate.prototype, "nodePermissions", void 0);
exports.FlowTemplate = FlowTemplate = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_templates' })
], FlowTemplate);
//# sourceMappingURL=flow-template.entity.js.map