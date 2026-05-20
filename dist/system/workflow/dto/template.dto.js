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
exports.PublishTemplateDto = exports.TemplatePageListDto = exports.UpdateTemplateDto = exports.CreateTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class CreateTemplateDto {
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程名称' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程编码' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程说明', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联表单定义ID', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "formDefId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '节点列表（含坐标）', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "nodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '连线列表', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "edges", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '节点权限配置', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "nodePermissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '扩展配置', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTemplateDto.prototype, "config", void 0);
class UpdateTemplateDto extends CreateTemplateDto {
}
exports.UpdateTemplateDto = UpdateTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "id", void 0);
class TemplatePageListDto extends base_dto_1.BasePageDto {
}
exports.TemplatePageListDto = TemplatePageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索名称', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TemplatePageListDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类过滤', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TemplatePageListDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TemplatePageListDto.prototype, "status", void 0);
class PublishTemplateDto {
}
exports.PublishTemplateDto = PublishTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishTemplateDto.prototype, "id", void 0);
//# sourceMappingURL=template.dto.js.map