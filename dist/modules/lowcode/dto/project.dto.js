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
exports.ProjectPageListDto = exports.ProjectUpdateDto = exports.ProjectCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
class ProjectCreateDto extends base_dto_1.BaseCreateDto {
}
exports.ProjectCreateDto = ProjectCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目名称', example: "我的项目" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectCreateDto.prototype, "projectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProjectCreateDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: "项目备注信息" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectCreateDto.prototype, "remark", void 0);
class ProjectUpdateDto extends ProjectCreateDto {
}
exports.ProjectUpdateDto = ProjectUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectUpdateDto.prototype, "id", void 0);
class ProjectPageListDto extends base_dto_1.BasePageDto {
}
exports.ProjectPageListDto = ProjectPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目名称', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectPageListDto.prototype, "projectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ProjectPageListDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建人', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectPageListDto.prototype, "createBy", void 0);
//# sourceMappingURL=project.dto.js.map