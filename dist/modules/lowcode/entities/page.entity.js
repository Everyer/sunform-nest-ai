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
exports.Page = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_hasuser_entity_1 = require("../../../common/base.hasuser.entity");
const project_entity_1 = require("./project.entity");
let Page = class Page extends base_hasuser_entity_1.BaseHasUserModel {
};
exports.Page = Page;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "页面名称"
    }),
    __metadata("design:type", String)
], Page.prototype, "pageName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    }),
    __metadata("design:type", Boolean)
], Page.prototype, "isEnable", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => project_entity_1.Project),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "项目id"
    }),
    __metadata("design:type", String)
], Page.prototype, "projectId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], Page.prototype, "remark", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => project_entity_1.Project),
    __metadata("design:type", project_entity_1.Project)
], Page.prototype, "project", void 0);
exports.Page = Page = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tb_page', paranoid: true })
], Page);
//# sourceMappingURL=page.entity.js.map