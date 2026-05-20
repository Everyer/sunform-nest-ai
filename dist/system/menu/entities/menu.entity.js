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
exports.Menu = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
let Menu = class Menu extends base_entity_1.BaseModel {
};
exports.Menu = Menu;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
        comment: "父级ID"
    }),
    __metadata("design:type", String)
], Menu.prototype, "pid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        comment: "菜单名称",
    }),
    __metadata("design:type", String)
], Menu.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "菜单编码",
        unique: true,
    }),
    __metadata("design:type", String)
], Menu.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否用于导航栏"
    }),
    __metadata("design:type", Boolean)
], Menu.prototype, "isNav", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        defaultValue: 'menu',
        comment: "菜单类型"
    }),
    __metadata("design:type", String)
], Menu.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "菜单图标"
    }),
    __metadata("design:type", String)
], Menu.prototype, "icon", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: false,
        comment: "菜单路由路径"
    }),
    __metadata("design:type", String)
], Menu.prototype, "path", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true,
        comment: "前端组件路径"
    }),
    __metadata("design:type", String)
], Menu.prototype, "component", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        comment: "低代码编码"
    }),
    __metadata("design:type", String)
], Menu.prototype, "lowCodeCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态"
    }),
    __metadata("design:type", Boolean)
], Menu.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    }),
    __metadata("design:type", Number)
], Menu.prototype, "sort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注信息"
    }),
    __metadata("design:type", String)
], Menu.prototype, "remark", void 0);
exports.Menu = Menu = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'menus' })
], Menu);
//# sourceMappingURL=menu.entity.js.map