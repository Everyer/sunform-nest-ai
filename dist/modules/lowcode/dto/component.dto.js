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
exports.UpdateOperatorsDto = exports.GetConfigByOtherProjectDto = exports.ComponentPageListDto = exports.ComponentUpdateDto = exports.ComponentCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
const component_constants_1 = require("../constants/component.constants");
class ComponentCreateDto extends base_dto_1.BaseCreateDto {
}
exports.ComponentCreateDto = ComponentCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件名称', example: "按钮组件" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "componentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件代码', example: "btn_001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "componentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件类型', example: component_constants_1.ComponentType.WEB, enum: component_constants_1.ComponentType }),
    (0, class_validator_1.IsEnum)(component_constants_1.ComponentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "componentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件配置', example: {}, required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ComponentCreateDto.prototype, "componentConfig", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页面ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ComponentCreateDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '版本号', example: 100, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ComponentCreateDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: "组件备注信息", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentCreateDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可操作人ID数组', example: ["user-id-1", "user-id-2"], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ComponentCreateDto.prototype, "operatorIds", void 0);
class ComponentUpdateDto extends ComponentCreateDto {
}
exports.ComponentUpdateDto = ComponentUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ComponentUpdateDto.prototype, "id", void 0);
class ComponentPageListDto extends base_dto_1.BasePageDto {
}
exports.ComponentPageListDto = ComponentPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件名称', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "componentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件代码', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "componentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件类型', example: component_constants_1.ComponentType.WEB, enum: component_constants_1.ComponentType, required: false }),
    (0, class_validator_1.IsEnum)(component_constants_1.ComponentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "componentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目ID', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页面ID', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可用', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ComponentPageListDto.prototype, "isEnable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建人', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ComponentPageListDto.prototype, "createBy", void 0);
class GetConfigByOtherProjectDto {
}
exports.GetConfigByOtherProjectDto = GetConfigByOtherProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '项目ID', example: "project-uuid-123" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetConfigByOtherProjectDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件ID', example: "component-uuid-123", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetConfigByOtherProjectDto.prototype, "componentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件代码', example: "btn_001", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetConfigByOtherProjectDto.prototype, "componentCode", void 0);
class UpdateOperatorsDto {
}
exports.UpdateOperatorsDto = UpdateOperatorsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组件ID', example: "component-uuid-123" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateOperatorsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '可操作人ID数组', example: ["user-id-1", "user-id-2"] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], UpdateOperatorsDto.prototype, "operatorIds", void 0);
//# sourceMappingURL=component.dto.js.map