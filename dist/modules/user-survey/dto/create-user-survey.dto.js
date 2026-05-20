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
exports.UserSurveyPageListDto = exports.UserSurveyUpdateDto = exports.UserSurveyCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const base_dto_1 = require("../../../common/base.dto");
class UserSurveyCreateDto extends base_dto_1.BaseCreateDto {
}
exports.UserSurveyCreateDto = UserSurveyCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '姓名', example: "张三" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', example: "1" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年龄', example: "25" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号码', example: "13800138000" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目前在哪个城市', example: "北京" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位意向', example: "销售" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "postIntention", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否需要提供住宿', example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserSurveyCreateDto.prototype, "needAccommodation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否需要提供食宿及交通补贴', example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserSurveyCreateDto.prototype, "needAccommodationAndTransportation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyCreateDto.prototype, "remark", void 0);
class UserSurveyUpdateDto extends UserSurveyCreateDto {
}
exports.UserSurveyUpdateDto = UserSurveyUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserSurveyUpdateDto.prototype, "id", void 0);
class UserSurveyPageListDto extends base_dto_1.BasePageDto {
}
exports.UserSurveyPageListDto = UserSurveyPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '姓名', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '年龄', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号码', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '目前在哪个城市', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岗位意向', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "postIntention", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建人', example: "", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserSurveyPageListDto.prototype, "createBy", void 0);
//# sourceMappingURL=create-user-survey.dto.js.map