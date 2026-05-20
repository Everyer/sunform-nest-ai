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
exports.Staff = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
const department_entity_1 = require("../../department/entities/department.entity");
const post_entity_1 = require("../../post/entities/post.entity");
let Staff = class Staff extends base_entity_1.BaseModel {
};
exports.Staff = Staff;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => department_entity_1.Department),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
        comment: "部门ID",
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }),
    __metadata("design:type", String)
], Staff.prototype, "deptId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => department_entity_1.Department),
    __metadata("design:type", department_entity_1.Department)
], Staff.prototype, "department", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => post_entity_1.Post),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
        comment: "岗位ID",
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }),
    __metadata("design:type", String)
], Staff.prototype, "postId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => post_entity_1.Post),
    __metadata("design:type", post_entity_1.Post)
], Staff.prototype, "post", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "员工姓名",
    }),
    __metadata("design:type", String)
], Staff.prototype, "staffName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "员工编号",
        unique: true,
    }),
    __metadata("design:type", String)
], Staff.prototype, "staffCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(11),
        allowNull: false,
        comment: "手机号码"
    }),
    __metadata("design:type", String)
], Staff.prototype, "mobile", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(2),
        allowNull: false,
        defaultValue: "1",
        comment: "性别"
    }),
    __metadata("design:type", String)
], Staff.prototype, "gender", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        comment: "邮箱"
    }),
    __metadata("design:type", String)
], Staff.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(18),
        allowNull: false,
        comment: "身份证"
    }),
    __metadata("design:type", String)
], Staff.prototype, "idCard", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "状态"
    }),
    __metadata("design:type", Boolean)
], Staff.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "排序"
    }),
    __metadata("design:type", Number)
], Staff.prototype, "sort", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注信息"
    }),
    __metadata("design:type", String)
], Staff.prototype, "remark", void 0);
exports.Staff = Staff = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'staffs' })
], Staff);
//# sourceMappingURL=staff.entity.js.map