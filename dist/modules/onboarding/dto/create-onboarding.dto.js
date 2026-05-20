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
exports.OnboardingPageListDto = exports.OnboardingUpdateDto = exports.OnboardingCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
class OnboardingCreateDto extends base_dto_1.BaseCreateDto {
}
exports.OnboardingCreateDto = OnboardingCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '台账信息ID', example: "" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "userSurveyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入职日期', example: "2024-01-01" }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], OnboardingCreateDto.prototype, "onboardingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', example: "13800138000" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人资对接人ID', example: "" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "hrStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '信息来源', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入职地点', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租赁状态', example: "" }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "rentalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租金＋电池', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "rentWithBattery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租金＋车', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "rentWithVehicle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租车对接人ID', example: "" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "rentalStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否办电话卡', example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], OnboardingCreateDto.prototype, "hasPhoneCard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '收款方式', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingCreateDto.prototype, "remark", void 0);
class OnboardingUpdateDto extends OnboardingCreateDto {
}
exports.OnboardingUpdateDto = OnboardingUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OnboardingUpdateDto.prototype, "id", void 0);
class OnboardingPageListDto extends base_dto_1.BasePageDto {
}
exports.OnboardingPageListDto = OnboardingPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '台账信息ID', example: "", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "userSurveyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入职日期', example: "", required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], OnboardingPageListDto.prototype, "onboardingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人资对接人ID', example: "", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "hrStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入职地点', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租赁状态', example: "", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "rentalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '租车对接人ID', example: "", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OnboardingPageListDto.prototype, "rentalStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否办电话卡', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], OnboardingPageListDto.prototype, "hasPhoneCard", void 0);
//# sourceMappingURL=create-onboarding.dto.js.map