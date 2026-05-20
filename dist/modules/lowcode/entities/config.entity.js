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
exports.LowcodeConfig = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const base_entity_1 = require("../../../common/base.entity");
let LowcodeConfig = class LowcodeConfig extends base_entity_1.BaseModel {
};
exports.LowcodeConfig = LowcodeConfig;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        comment: "用户ID"
    }),
    __metadata("design:type", String)
], LowcodeConfig.prototype, "userid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true,
        comment: "基础地址"
    }),
    __metadata("design:type", String)
], LowcodeConfig.prototype, "baseUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        comment: "Token键名"
    }),
    __metadata("design:type", String)
], LowcodeConfig.prototype, "tokenKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        comment: "Token值"
    }),
    __metadata("design:type", String)
], LowcodeConfig.prototype, "tokenValue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
        allowNull: true,
        comment: "主机地址"
    }),
    __metadata("design:type", String)
], LowcodeConfig.prototype, "host", void 0);
exports.LowcodeConfig = LowcodeConfig = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tb_lowcode_config', paranoid: true })
], LowcodeConfig);
//# sourceMappingURL=config.entity.js.map