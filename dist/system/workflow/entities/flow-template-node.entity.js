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
exports.FlowTemplateNode = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_template_entity_1 = require("./flow-template.entity");
const flow_template_edge_entity_1 = require("./flow-template-edge.entity");
const flow_node_permission_entity_1 = require("./flow-node-permission.entity");
let FlowTemplateNode = class FlowTemplateNode extends base_entity_1.BaseModel {
};
exports.FlowTemplateNode = FlowTemplateNode;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        primaryKey: true,
        allowNull: false,
        comment: '唯一主键'
    }),
    __metadata("design:type", String)
], FlowTemplateNode.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_entity_1.FlowTemplate),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '所属模板' }),
    __metadata("design:type", String)
], FlowTemplateNode.prototype, "templateId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_entity_1.FlowTemplate),
    __metadata("design:type", flow_template_entity_1.FlowTemplate)
], FlowTemplateNode.prototype, "template", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '节点名称' }),
    __metadata("design:type", String)
], FlowTemplateNode.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), allowNull: false, comment: '节点类型：start/approve/condition/end' }),
    __metadata("design:type", String)
], FlowTemplateNode.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), allowNull: true, comment: '审批人类型：specified_user/specified_role/superior/superior_level/custom' }),
    __metadata("design:type", String)
], FlowTemplateNode.prototype, "assigneeType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '审批人配置值' }),
    __metadata("design:type", Object)
], FlowTemplateNode.prototype, "assigneeValue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: true, comment: '画布X坐标' }),
    __metadata("design:type", Number)
], FlowTemplateNode.prototype, "positionX", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: true, comment: '画布Y坐标' }),
    __metadata("design:type", Number)
], FlowTemplateNode.prototype, "positionY", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '节点配置（会签/或签、超时等）' }),
    __metadata("design:type", Object)
], FlowTemplateNode.prototype, "config", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0, comment: '排序' }),
    __metadata("design:type", Number)
], FlowTemplateNode.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_template_edge_entity_1.FlowTemplateEdge, { foreignKey: 'sourceNodeId' }),
    __metadata("design:type", Array)
], FlowTemplateNode.prototype, "outgoingEdges", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_template_edge_entity_1.FlowTemplateEdge, { foreignKey: 'targetNodeId' }),
    __metadata("design:type", Array)
], FlowTemplateNode.prototype, "incomingEdges", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_node_permission_entity_1.FlowNodePermission),
    __metadata("design:type", Array)
], FlowTemplateNode.prototype, "fieldPermissions", void 0);
exports.FlowTemplateNode = FlowTemplateNode = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_template_nodes' })
], FlowTemplateNode);
//# sourceMappingURL=flow-template-node.entity.js.map