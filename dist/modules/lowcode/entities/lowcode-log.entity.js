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
exports.LowcodeLog = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const moment = require("moment");
let LowcodeLog = class LowcodeLog extends sequelize_typescript_1.Model {
};
exports.LowcodeLog = LowcodeLog;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
        primaryKey: true,
        comment: "唯一主键"
    }),
    __metadata("design:type", String)
], LowcodeLog.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        comment: "低代码配置代码"
    }),
    __metadata("design:type", String)
], LowcodeLog.prototype, "componentCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: false,
        comment: "组件配置"
    }),
    __metadata("design:type", Object)
], LowcodeLog.prototype, "componentConfig", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        comment: "组件名称"
    }),
    __metadata("design:type", String)
], LowcodeLog.prototype, "componentName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], LowcodeLog.prototype, "remark", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    }),
    __metadata("design:type", Date)
], LowcodeLog.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    }),
    __metadata("design:type", Date)
], LowcodeLog.prototype, "updatedAt", void 0);
exports.LowcodeLog = LowcodeLog = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'tb_lowcode_log', paranoid: false })
], LowcodeLog);
//# sourceMappingURL=lowcode-log.entity.js.map