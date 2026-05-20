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
exports.FlowInstanceNode = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_instance_entity_1 = require("./flow-instance.entity");
const flow_template_node_entity_1 = require("./flow-template-node.entity");
let FlowInstanceNode = class FlowInstanceNode extends base_entity_1.BaseModel {
};
exports.FlowInstanceNode = FlowInstanceNode;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_instance_entity_1.FlowInstance),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '流程实例' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "instanceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_instance_entity_1.FlowInstance),
    __metadata("design:type", flow_instance_entity_1.FlowInstance)
], FlowInstanceNode.prototype, "instance", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_node_entity_1.FlowTemplateNode),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '对应模板节点' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "templateNodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_node_entity_1.FlowTemplateNode),
    __metadata("design:type", flow_template_node_entity_1.FlowTemplateNode)
], FlowInstanceNode.prototype, "templateNode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '节点名称（快照）' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "nodeName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), allowNull: false, comment: '节点类型（快照）' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "nodeType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(20), defaultValue: 'pending', comment: '状态：pending/processing/approved/rejected/transferred/cancelled' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '审批人' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "assignee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '审批人姓名' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "assigneeName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true, comment: '审批意见' }),
    __metadata("design:type", String)
], FlowInstanceNode.prototype, "comment", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '附件列表' }),
    __metadata("design:type", Object)
], FlowInstanceNode.prototype, "attachments", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true, comment: '开始处理时间' }),
    __metadata("design:type", Date)
], FlowInstanceNode.prototype, "startedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true, comment: '处理完成时间' }),
    __metadata("design:type", Date)
], FlowInstanceNode.prototype, "finishedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true, comment: '处理耗时（秒）' }),
    __metadata("design:type", Number)
], FlowInstanceNode.prototype, "durationSeconds", void 0);
exports.FlowInstanceNode = FlowInstanceNode = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_instance_nodes' })
], FlowInstanceNode);
//# sourceMappingURL=flow-instance-node.entity.js.map