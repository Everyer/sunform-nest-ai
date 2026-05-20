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
exports.Component = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_hasuser_entity_1 = require("../../../common/base.hasuser.entity");
const project_entity_1 = require("./project.entity");
const page_entity_1 = require("./page.entity");
const component_constants_1 = require("../constants/component.constants");
let Component = class Component extends base_hasuser_entity_1.BaseHasUserModel {
};
exports.Component = Component;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "组件名称"
    }),
    __metadata("design:type", String)
], Component.prototype, "componentName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        comment: "组件配置"
    }),
    __metadata("design:type", Object)
], Component.prototype, "componentConfig", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        unique: true,
        allowNull: false,
        comment: "组件代码"
    }),
    __metadata("design:type", String)
], Component.prototype, "componentCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(10),
        allowNull: false,
        defaultValue: component_constants_1.DEFAULT_COMPONENT_TYPE,
        comment: "组件类型：web-web端，mobile-移动端"
    }),
    __metadata("design:type", String)
], Component.prototype, "componentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    }),
    __metadata("design:type", Boolean)
], Component.prototype, "isEnable", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        comment: "版本号",
        defaultValue: 100,
    }),
    __metadata("design:type", Number)
], Component.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], Component.prototype, "remark", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        comment: "可操作人ID数组"
    }),
    __metadata("design:type", Array)
], Component.prototype, "operatorIds", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => project_entity_1.Project),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "项目id"
    }),
    __metadata("design:type", String)
], Component.prototype, "projectId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => page_entity_1.Page),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "页面id"
    }),
    __metadata("design:type", String)
], Component.prototype, "pageId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => project_entity_1.Project),
    __metadata("design:type", project_entity_1.Project)
], Component.prototype, "project", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => page_entity_1.Page),
    __metadata("design:type", page_entity_1.Page)
], Component.prototype, "page", void 0);
exports.Component = Component = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tb_components', paranoid: true })
], Component);
//# sourceMappingURL=component.entity.js.map