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
exports.FlowInstance = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_template_entity_1 = require("./flow-template.entity");
const flow_form_def_entity_1 = require("./flow-form-def.entity");
const flow_instance_node_entity_1 = require("./flow-instance-node.entity");
const flow_instance_data_entity_1 = require("./flow-instance-data.entity");
let FlowInstance = class FlowInstance extends base_entity_1.BaseModel {
};
exports.FlowInstance = FlowInstance;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_template_entity_1.FlowTemplate),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '流程模板' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "templateId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_template_entity_1.FlowTemplate),
    __metadata("design:type", flow_template_entity_1.FlowTemplate)
], FlowInstance.prototype, "template", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true, comment: '发起时模板版本号' }),
    __metadata("design:type", Number)
], FlowInstance.prototype, "templateVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_form_def_entity_1.FlowFormDef),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true, comment: '表单定义' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "formDefId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_form_def_entity_1.FlowFormDef),
    __metadata("design:type", flow_form_def_entity_1.FlowFormDef)
], FlowInstance.prototype, "formDef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(200), allowNull: true, comment: '实例标题' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(20), defaultValue: 'draft', comment: '状态：draft/running/approved/rejected/cancelled' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false, comment: '发起人' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "initiator", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '发起人部门' }),
    __metadata("design:type", String)
], FlowInstance.prototype, "initiatorDept", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '当前活跃节点ID数组' }),
    __metadata("design:type", Array)
], FlowInstance.prototype, "currentNodeIds", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, defaultValue: 0, comment: '优先级：0=普通 1=紧急 2=特急' }),
    __metadata("design:type", Number)
], FlowInstance.prototype, "priority", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true, comment: '截止日期' }),
    __metadata("design:type", Date)
], FlowInstance.prototype, "dueDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true, comment: '完成时间' }),
    __metadata("design:type", Date)
], FlowInstance.prototype, "finishedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_instance_node_entity_1.FlowInstanceNode),
    __metadata("design:type", Array)
], FlowInstance.prototype, "nodes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_instance_data_entity_1.FlowInstanceData),
    __metadata("design:type", Array)
], FlowInstance.prototype, "dataSnapshots", void 0);
exports.FlowInstance = FlowInstance = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_instances' })
], FlowInstance);
//# sourceMappingURL=flow-instance.entity.js.map