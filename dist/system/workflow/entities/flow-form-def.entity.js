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
exports.FlowFormDef = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_form_field_entity_1 = require("./flow-form-field.entity");
let FlowFormDef = class FlowFormDef extends base_entity_1.BaseModel {
};
exports.FlowFormDef = FlowFormDef;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '表单名称' }),
    __metadata("design:type", String)
], FlowFormDef.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), unique: true, allowNull: false, comment: '表单编码' }),
    __metadata("design:type", String)
], FlowFormDef.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: true, comment: '关联 Sunform 页面 ID' }),
    __metadata("design:type", String)
], FlowFormDef.prototype, "sunformPageId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true, comment: '表单描述' }),
    __metadata("design:type", String)
], FlowFormDef.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '扩展配置' }),
    __metadata("design:type", Object)
], FlowFormDef.prototype, "config", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => flow_form_field_entity_1.FlowFormField),
    __metadata("design:type", Array)
], FlowFormDef.prototype, "fields", void 0);
exports.FlowFormDef = FlowFormDef = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_form_defs' })
], FlowFormDef);
//# sourceMappingURL=flow-form-def.entity.js.map