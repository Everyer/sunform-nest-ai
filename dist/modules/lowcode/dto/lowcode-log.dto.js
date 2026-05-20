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
exports.LowcodeLogUpdateRemarkDto = exports.LowcodeLogPageByCodeDto = exports.LowcodeLogByCodeDto = exports.LowcodeLogPageListDto = exports.LowcodeLogCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
class LowcodeLogCreateDto {
}
exports.LowcodeLogCreateDto = LowcodeLogCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低代码配置代码', example: "config_001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LowcodeLogCreateDto.prototype, "componentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件配置', example: {} }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], LowcodeLogCreateDto.prototype, "componentConfig", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件名称', example: "表单组件" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LowcodeLogCreateDto.prototype, "componentName", void 0);
class LowcodeLogPageListDto extends base_dto_1.BasePageDto {
}
exports.LowcodeLogPageListDto = LowcodeLogPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低代码配置代码', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LowcodeLogPageListDto.prototype, "componentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件名称', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LowcodeLogPageListDto.prototype, "componentName", void 0);
class LowcodeLogByCodeDto {
}
exports.LowcodeLogByCodeDto = LowcodeLogByCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低代码配置代码', example: "config_001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LowcodeLogByCodeDto.prototype, "componentCode", void 0);
class LowcodeLogPageByCodeDto extends base_dto_1.BasePageDto {
}
exports.LowcodeLogPageByCodeDto = LowcodeLogPageByCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低代码配置代码', example: "config_001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LowcodeLogPageByCodeDto.prototype, "componentCode", void 0);
class LowcodeLogUpdateRemarkDto {
}
exports.LowcodeLogUpdateRemarkDto = LowcodeLogUpdateRemarkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '日志ID', example: "uuid-string" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LowcodeLogUpdateRemarkDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注内容', example: "这是一条备注", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LowcodeLogUpdateRemarkDto.prototype, "remark", void 0);
//# sourceMappingURL=lowcode-log.dto.js.map