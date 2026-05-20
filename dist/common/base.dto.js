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
exports.BasePageDto = exports.BaseCreateDto = exports.BaseResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BaseResponseDto {
}
exports.BaseResponseDto = BaseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态码', example: 0 }),
    __metadata("design:type", Number)
], BaseResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提示信息', example: '操作成功' }),
    __metadata("design:type", String)
], BaseResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否成功', example: true }),
    __metadata("design:type", Boolean)
], BaseResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '返回数据', type: Object }),
    __metadata("design:type", Object)
], BaseResponseDto.prototype, "data", void 0);
class BaseCreateDto {
}
exports.BaseCreateDto = BaseCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建者ID', example: 'uuid', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BaseCreateDto.prototype, "createBy", void 0);
class BasePageDto {
}
exports.BasePageDto = BasePageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前页码', example: 1, default: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BasePageDto.prototype, "pageindex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页条数', example: 10, default: 10 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BasePageDto.prototype, "pagesize", void 0);
//# sourceMappingURL=base.dto.js.map