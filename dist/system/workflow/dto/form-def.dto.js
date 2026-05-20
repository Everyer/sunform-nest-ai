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
exports.FormDefPageListDto = exports.UpdateFormDefDto = exports.CreateFormDefDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class CreateFormDefDto {
}
exports.CreateFormDefDto = CreateFormDefDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单名称' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormDefDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单编码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormDefDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联 Sunform 页面 ID', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormDefDto.prototype, "sunformPageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单描述', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormDefDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字段列表', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateFormDefDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '扩展配置', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormDefDto.prototype, "config", void 0);
class UpdateFormDefDto extends CreateFormDefDto {
}
exports.UpdateFormDefDto = UpdateFormDefDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateFormDefDto.prototype, "id", void 0);
class FormDefPageListDto extends base_dto_1.BasePageDto {
}
exports.FormDefPageListDto = FormDefPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索名称', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDefPageListDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索编码', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDefPageListDto.prototype, "code", void 0);
//# sourceMappingURL=form-def.dto.js.map