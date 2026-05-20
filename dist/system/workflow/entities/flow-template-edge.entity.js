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
exports.FlowTemplateEdge = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_template_entity_1 = require("./flow-template.entity");
const flow_template_node_entity_1 = require("./flow-template-node.entity");
let FlowTemplateEdge = class FlowTemplateEdge extends base_entity_1.BaseModel {
};
exports.FlowTemplateEdge = FlowTemplateEdge;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        primaryKey: true,
        allowNull: false,
        comment: '唯一主键'
    }),
    __metadata("design:type", String)
], FlowTemplateEdge.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_entity_1.FlowTemplate),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '所属模板' }),
    __metadata("design:type", String)
], FlowTemplateEdge.prototype, "templateId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_entity_1.FlowTemplate),
    __metadata("design:type", flow_template_entity_1.FlowTemplate)
], FlowTemplateEdge.prototype, "template", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_node_entity_1.FlowTemplateNode),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '起始节点' }),
    __metadata("design:type", String)
], FlowTemplateEdge.prototype, "sourceNodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_node_entity_1.FlowTemplateNode, { foreignKey: 'sourceNodeId' }),
    __metadata("design:type", flow_template_node_entity_1.FlowTemplateNode)
], FlowTemplateEdge.prototype, "sourceNode", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_node_entity_1.FlowTemplateNode),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '目标节点' }),
    __metadata("design:type", String)
], FlowTemplateEdge.prototype, "targetNodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_node_entity_1.FlowTemplateNode, { foreignKey: 'targetNodeId' }),
    __metadata("design:type", flow_template_node_entity_1.FlowTemplateNode)
], FlowTemplateEdge.prototype, "targetNode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '连线标签' }),
    __metadata("design:type", String)
], FlowTemplateEdge.prototype, "label", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '条件表达式' }),
    __metadata("design:type", Object)
], FlowTemplateEdge.prototype, "condition", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0, comment: '排序' }),
    __metadata("design:type", Number)
], FlowTemplateEdge.prototype, "order", void 0);
exports.FlowTemplateEdge = FlowTemplateEdge = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_template_edges' })
], FlowTemplateEdge);
//# sourceMappingURL=flow-template-edge.entity.js.map