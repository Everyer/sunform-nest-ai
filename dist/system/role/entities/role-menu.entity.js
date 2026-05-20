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
exports.RoleMenu = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const role_entity_1 = require("./role.entity");
const menu_entity_1 = require("../../menu/entities/menu.entity");
let RoleMenu = class RoleMenu extends sequelize_typescript_1.Model {
};
exports.RoleMenu = RoleMenu;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => role_entity_1.Role),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], RoleMenu.prototype, "roleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => menu_entity_1.Menu),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], RoleMenu.prototype, "menuId", void 0);
exports.RoleMenu = RoleMenu = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'rolemenus' })
], RoleMenu);
//# sourceMappingURL=role-menu.entity.js.map