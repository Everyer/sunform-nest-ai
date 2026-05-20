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
exports.DepartmentPageListDto = exports.DepartmentUpdateDto = exports.DepartmentCreateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class DepartmentCreateDto {
}
exports.DepartmentCreateDto = DepartmentCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '上级部门ID', example: "0", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentCreateDto.prototype, "pid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门名称', example: "研发部" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepartmentCreateDto.prototype, "departmentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门负责人', example: "张三", required: false }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DepartmentCreateDto.prototype, "leader", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示排序', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepartmentCreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门状态 (true:启用, false:禁用)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DepartmentCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "主要负责产品研发", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentCreateDto.prototype, "remark", void 0);
class DepartmentUpdateDto extends DepartmentCreateDto {
}
exports.DepartmentUpdateDto = DepartmentUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '部门ID', example: "uuid-dept-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DepartmentUpdateDto.prototype, "id", void 0);
class DepartmentPageListDto extends base_dto_1.BasePageDto {
}
exports.DepartmentPageListDto = DepartmentPageListDto;
//# sourceMappingURL=create-department.dto.js.map