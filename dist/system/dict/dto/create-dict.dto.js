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
exports.DictPageListDto = exports.DictUpdateDto = exports.DictCreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class DictCreateDto {
}
exports.DictCreateDto = DictCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '父级字典ID', example: "0", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DictCreateDto.prototype, "pid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字典标签', example: "男" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DictCreateDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字典值/编码', example: "1" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DictCreateDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字典状态 (true:启用, false:禁用)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DictCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示排序', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DictCreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "性别男的字典定义", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DictCreateDto.prototype, "remark", void 0);
class DictUpdateDto extends DictCreateDto {
}
exports.DictUpdateDto = DictUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '字典ID', example: "uuid-dict-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DictUpdateDto.prototype, "id", void 0);
class DictPageListDto extends base_dto_1.BasePageDto {
}
exports.DictPageListDto = DictPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索标签名称', example: "男", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DictPageListDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索字典编码', example: "1", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DictPageListDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DictPageListDto.prototype, "status", void 0);
//# sourceMappingURL=create-dict.dto.js.map