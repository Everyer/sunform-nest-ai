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
exports.Role = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const menu_entity_1 = require("../../menu/entities/menu.entity");
const department_entity_1 = require("../../department/entities/department.entity");
const role_menu_entity_1 = require("./role-menu.entity");
const role_department_entity_1 = require("./role-department.entity");
let Role = class Role extends base_entity_1.BaseModel {
};
exports.Role = Role;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        comment: "角色名称"
    }),
    __metadata("design:type", String)
], Role.prototype, "roleName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        comment: "角色权限字符"
    }),
    __metadata("design:type", Object)
], Role.prototype, "roleKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        comment: "数据权限"
    }),
    __metadata("design:type", String)
], Role.prototype, "dataScope", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态"
    }),
    __metadata("design:type", Boolean)
], Role.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    }),
    __metadata("design:type", Number)
], Role.prototype, "sort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注信息"
    }),
    __metadata("design:type", String)
], Role.prototype, "remark", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => menu_entity_1.Menu, {
        through: () => role_menu_entity_1.RoleMenu,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }),
    __metadata("design:type", Array)
], Role.prototype, "menus", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => department_entity_1.Department, {
        through: () => role_department_entity_1.RoleDepartment,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }),
    __metadata("design:type", Array)
], Role.prototype, "departments", void 0);
exports.Role = Role = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'roles' })
], Role);
//# sourceMappingURL=role.entity.js.map