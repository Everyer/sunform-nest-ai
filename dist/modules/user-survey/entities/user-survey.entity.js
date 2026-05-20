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
exports.UserSurvey = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_hasuser_entity_1 = require("../../../common/base.hasuser.entity");
let UserSurvey = class UserSurvey extends base_hasuser_entity_1.BaseHasUserModel {
};
exports.UserSurvey = UserSurvey;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "姓名"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(2),
        allowNull: false,
        defaultValue: "1",
        comment: "性别"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "gender", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(10),
        allowNull: true,
        comment: "年龄"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "age", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
        comment: "手机号码"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "mobile", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "目前在哪个城市"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "岗位意向"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "postIntention", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        comment: "是否需要提供住宿"
    }),
    __metadata("design:type", Boolean)
], UserSurvey.prototype, "needAccommodation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        comment: "是否需要提供食宿及交通补贴"
    }),
    __metadata("design:type", Boolean)
], UserSurvey.prototype, "needAccommodationAndTransportation", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], UserSurvey.prototype, "remark", void 0);
exports.UserSurvey = UserSurvey = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'usersurveys' })
], UserSurvey);
//# sourceMappingURL=user-survey.entity.js.map