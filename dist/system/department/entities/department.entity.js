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
exports.Department = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const staff_entity_1 = require("../../staff/entities/staff.entity");
let Department = class Department extends base_entity_1.BaseModel {
};
exports.Department = Department;
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => staff_entity_1.Staff, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        hooks: true
    }),
    __metadata("design:type", Array)
], Department.prototype, "staffs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
        comment: "父级字典ID"
    }),
    __metadata("design:type", String)
], Department.prototype, "pid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        comment: "部门名称",
    }),
    __metadata("design:type", String)
], Department.prototype, "departmentName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "负责人"
    }),
    __metadata("design:type", String)
], Department.prototype, "leader", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态"
    }),
    __metadata("design:type", Boolean)
], Department.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    }),
    __metadata("design:type", Number)
], Department.prototype, "sort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注信息"
    }),
    __metadata("design:type", String)
], Department.prototype, "remark", void 0);
exports.Department = Department = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'departments' })
], Department);
//# sourceMappingURL=department.entity.js.map