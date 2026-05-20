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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSurveyService = void 0;
const common_1 = require("@nestjs/common");
const user_survey_entity_1 = require("./entities/user-survey.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
const user_entity_1 = require("../../system/user/entities/user.entity");
const staff_entity_1 = require("../../system/staff/entities/staff.entity");
const sequelize_2 = require("sequelize");
let UserSurveyService = class UserSurveyService {
    constructor(model) {
        this.model = model;
    }
    async create(CreateDto) {
        return this.model.create(CreateDto);
    }
    async findPageList(dto, createByWhere) {
        const { pageindex, pagesize, name, gender, age, mobile, address, postIntention } = dto;
        const where = {};
        if (createByWhere)
            Object.assign(where, createByWhere);
        if (name) {
            where.name = { [sequelize_2.Op.like]: `%${name}%` };
        }
        if (address) {
            where.address = { [sequelize_2.Op.like]: `%${address}%` };
        }
        if (mobile) {
            where.mobile = { [sequelize_2.Op.like]: `%${mobile}%` };
        }
        if (postIntention) {
            where.postIntention = { [sequelize_2.Op.like]: `%${postIntention}%` };
        }
        if (age) {
            where.age = { [sequelize_2.Op.like]: `%${age}%` };
        }
        if (gender) {
            where.gender = gender;
        }
        const { rows, count } = await this.model.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            include: [{
                    model: user_entity_1.User,
                    attributes: ['username'],
                    include: [{
                            model: staff_entity_1.Staff,
                            attributes: ['staffName']
                        }]
                }],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll();
    }
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id);
    }
    update(dto) {
        const { id } = dto;
        return this.model.update(dto, {
            where: {
                id
            }
        });
    }
    async remove(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        let count = await this.model.destroy({
            where: {
                id
            }
        });
        if (count > 0) {
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
};
exports.UserSurveyService = UserSurveyService;
exports.UserSurveyService = UserSurveyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_survey_entity_1.UserSurvey)),
    __metadata("design:paramtypes", [Object])
], UserSurveyService);
//# sourceMappingURL=user-survey.service.js.map