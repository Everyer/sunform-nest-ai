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
exports.FlowFormField = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const flow_form_def_entity_1 = require("./flow-form-def.entity");
let FlowFormField = class FlowFormField extends base_entity_1.BaseModel {
};
exports.FlowFormField = FlowFormField;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => flow_form_def_entity_1.FlowFormDef),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, comment: '所属表单定义' }),
    __metadata("design:type", String)
], FlowFormField.prototype, "formDefId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => flow_form_def_entity_1.FlowFormDef),
    __metadata("design:type", flow_form_def_entity_1.FlowFormDef)
], FlowFormField.prototype, "formDef", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false, comment: '字段标识' }),
    __metadata("design:type", String)
], FlowFormField.prototype, "fieldKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false, comment: '字段显示名' }),
    __metadata("design:type", String)
], FlowFormField.prototype, "fieldLabel", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), allowNull: false, comment: '字段类型' }),
    __metadata("design:type", String)
], FlowFormField.prototype, "fieldType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '选项列表' }),
    __metadata("design:type", Object)
], FlowFormField.prototype, "options", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB, allowNull: true, comment: '默认值' }),
    __metadata("design:type", Object)
], FlowFormField.prototype, "defaultValue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false, comment: '是否必填' }),
    __metadata("design:type", Boolean)
], FlowFormField.prototype, "required", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0, comment: '排序' }),
    __metadata("design:type", Number)
], FlowFormField.prototype, "sortOrder", void 0);
exports.FlowFormField = FlowFormField = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'flow_form_fields' })
], FlowFormField);
//# sourceMappingURL=flow-form-field.entity.js.map