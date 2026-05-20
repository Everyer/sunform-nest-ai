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
exports.PagePageListDto = exports.PageUpdateDto = exports.PageCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
class PageCreateDto extends base_dto_1.BaseCreateDto {
}
exports.PageCreateDto = PageCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页面名称', example: "首页" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PageCreateDto.prototype, "pageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PageCreateDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], PageCreateDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: "页面备注信息", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PageCreateDto.prototype, "remark", void 0);
class PageUpdateDto extends PageCreateDto {
}
exports.PageUpdateDto = PageUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PageUpdateDto.prototype, "id", void 0);
class PagePageListDto extends base_dto_1.BasePageDto {
}
exports.PagePageListDto = PagePageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页面名称', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PagePageListDto.prototype, "pageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目ID', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PagePageListDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PagePageListDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建人', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PagePageListDto.prototype, "createBy", void 0);
//# sourceMappingURL=page.dto.js.map