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
exports.FlowInstanceData = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_instance_entity_1 = require("./flow-instance.entity");
const flow_instance_node_entity_1 = require("./flow-instance-node.entity");
let FlowInstanceData = class FlowInstanceData extends base_entity_1.BaseModel {
};
exports.FlowInstanceData = FlowInstanceData;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_instance_entity_1.FlowInstance),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '流程实例' }),
    __metadata("design:type", String)
], FlowInstanceData.prototype, "instanceId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_instance_entity_1.FlowInstance),
    __metadata("design:type", flow_instance_entity_1.FlowInstance)
], FlowInstanceData.prototype, "instance", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_instance_node_entity_1.FlowInstanceNode),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true, comment: '节点（每节点一条记录）' }),
    __metadata("design:type", String)
], FlowInstanceData.prototype, "nodeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_instance_node_entity_1.FlowInstanceNode),
    __metadata("design:type", flow_instance_node_entity_1.FlowInstanceNode)
], FlowInstanceData.prototype, "node", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: false, comment: '表单字段值' }),
    __metadata("design:type", Object)
], FlowInstanceData.prototype, "data", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 1, comment: '数据版本号' }),
    __metadata("design:type", Number)
], FlowInstanceData.prototype, "dataVersion", void 0);
exports.FlowInstanceData = FlowInstanceData = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_instance_data' })
], FlowInstanceData);
//# sourceMappingURL=flow-instance-data.entity.js.map