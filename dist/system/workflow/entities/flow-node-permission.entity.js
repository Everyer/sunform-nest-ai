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
exports.FlowNodePermission = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_template_entity_1 = require("./flow-template.entity");
const flow_template_node_entity_1 = require("./flow-template-node.entity");
let FlowNodePermission = class FlowNodePermission extends base_entity_1.BaseModel {
};
exports.FlowNodePermission = FlowNodePermission;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_entity_1.FlowTemplate),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '流程模板' }),
    __metadata("design:type", String)
], FlowNodePermission.prototype, "templateId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_entity_1.FlowTemplate),
    __metadata("design:type", flow_template_entity_1.FlowTemplate)
], FlowNodePermission.prototype, "template", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_node_entity_1.FlowTemplateNode),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '模板节点' }),
    __metadata("design:type", String)
], FlowNodePermission.prototype, "nodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_node_entity_1.FlowTemplateNode),
    __metadata("design:type", flow_template_node_entity_1.FlowTemplateNode)
], FlowNodePermission.prototype, "node", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false, comment: '字段标识' }),
    __metadata("design:type", String)
], FlowNodePermission.prototype, "fieldKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(20), defaultValue: 'readonly', comment: '权限：editable/readonly/hidden' }),
    __metadata("design:type", String)
], FlowNodePermission.prototype, "permission", void 0);
exports.FlowNodePermission = FlowNodePermission = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_node_permissions' })
], FlowNodePermission);
//# sourceMappingURL=flow-node-permission.entity.js.map