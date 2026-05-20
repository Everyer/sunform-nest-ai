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
exports.PageListDto = exports.UpdateDto = exports.CreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateDto {
}
exports.CreateDto = CreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位名称', example: "董事长" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDto.prototype, "postName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位编码', example: "ceo" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDto.prototype, "postCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示排序', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位状态 (true:启用, false:禁用)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "公司最高决策岗位", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDto.prototype, "remark", void 0);
class UpdateDto extends CreateDto {
}
exports.UpdateDto = UpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位ID', example: "uuid-post-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateDto.prototype, "id", void 0);
class PageListDto extends base_dto_1.BasePageDto {
}
exports.PageListDto = PageListDto;
//# sourceMappingURL=create-post.dto.js.map