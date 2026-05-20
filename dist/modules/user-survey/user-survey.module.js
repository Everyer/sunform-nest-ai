"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSurveyModule = void 0;
const common_1 = require("@nestjs/common");
const user_survey_service_1 = require("./user-survey.service");
const user_survey_controller_1 = require("./user-survey.controller");
const sequelize_1 = require("@nestjs/sequelize");
const user_survey_entity_1 = require("./entities/user-survey.entity");
let UserSurveyModule = class UserSurveyModule {
};
exports.UserSurveyModule = UserSurveyModule;
exports.UserSurveyModule = UserSurveyModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([user_survey_entity_1.UserSurvey])],
        controllers: [user_survey_controller_1.UserSurveyController],
        providers: [user_survey_service_1.UserSurveyService],
    })
], UserSurveyModule);
//# sourceMappingURL=user-survey.module.js.map