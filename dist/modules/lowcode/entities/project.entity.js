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
exports.Project = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_hasuser_entity_1 = require("../../../common/base.hasuser.entity");
let Project = class Project extends base_hasuser_entity_1.BaseHasUserModel {
};
exports.Project = Project;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "项目名称"
    }),
    __metadata("design:type", String)
], Project.prototype, "projectName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否可用"
    }),
    __metadata("design:type", Boolean)
], Project.prototype, "isEnable", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], Project.prototype, "remark", void 0);
exports.Project = Project = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tb_project', paranoid: true })
], Project);
//# sourceMappingURL=project.entity.js.map