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
exports.Onboarding = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_hasuser_entity_1 = require("../../../common/base.hasuser.entity");
const staff_entity_1 = require("../../../system/staff/entities/staff.entity");
const user_survey_entity_1 = require("../../user-survey/entities/user-survey.entity");
let Onboarding = class Onboarding extends base_hasuser_entity_1.BaseHasUserModel {
};
exports.Onboarding = Onboarding;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_survey_entity_1.UserSurvey),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "台账信息ID"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "userSurveyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_survey_entity_1.UserSurvey),
    __metadata("design:type", user_survey_entity_1.UserSurvey)
], Onboarding.prototype, "userSurvey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        allowNull: false,
        comment: "入职日期"
    }),
    __metadata("design:type", Date)
], Onboarding.prototype, "onboardingDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
        comment: "联系电话"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "mobile", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => staff_entity_1.Staff),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "人资对接人ID"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "hrStaffId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => staff_entity_1.Staff, 'hrStaffId'),
    __metadata("design:type", staff_entity_1.Staff)
], Onboarding.prototype, "hrStaff", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "信息来源"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        comment: "入职地点"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        comment: "租赁状态"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "rentalStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "租金＋电池"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "rentWithBattery", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "租金＋车"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "rentWithVehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => staff_entity_1.Staff),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        comment: "租车对接人ID"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "rentalStaffId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => staff_entity_1.Staff, 'rentalStaffId'),
    __metadata("design:type", staff_entity_1.Staff)
], Onboarding.prototype, "rentalStaff", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "是否办电话卡"
    }),
    __metadata("design:type", Boolean)
], Onboarding.prototype, "hasPhoneCard", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "收款方式"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "paymentMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], Onboarding.prototype, "remark", void 0);
exports.Onboarding = Onboarding = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'onboardings' })
], Onboarding);
//# sourceMappingURL=onboarding.entity.js.map