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
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const onboarding_entity_1 = require("./entities/onboarding.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
const user_entity_1 = require("../../system/user/entities/user.entity");
const staff_entity_1 = require("../../system/staff/entities/staff.entity");
const dict_service_1 = require("../../system/dict/dict.service");
const user_survey_entity_1 = require("../user-survey/entities/user-survey.entity");
let OnboardingService = class OnboardingService {
    constructor(model, dictService) {
        this.model = model;
        this.dictService = dictService;
    }
    async create(CreateDto) {
        return this.model.create(CreateDto);
    }
    async findPageList(dto, createByWhere) {
        const { pageindex, pagesize } = dto;
        const where = {};
        if (createByWhere)
            Object.assign(where, createByWhere);
        let res = await this.model.findAndCountAll({
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
                }, {
                    model: user_survey_entity_1.UserSurvey,
                    attributes: ['name'],
                }, {
                    model: staff_entity_1.Staff,
                    attributes: ['staffName'],
                    as: "hrStaff"
                }, {
                    model: staff_entity_1.Staff,
                    attributes: ['staffName'],
                    as: "rentalStaff"
                }]
        });
        if (res) {
            const rows = await Promise.all(res.rows.map(async (row) => ({
                ...row.get({ plain: true }),
                rentalStatusName: await this.dictService.getDictLabel(row.rentalStatus)
            })));
            return {
                list: rows,
                total: res.count
            };
        }
        else {
            throw new business_exception_1.BusinessException('查询失败');
        }
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
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(onboarding_entity_1.Onboarding)),
    __metadata("design:paramtypes", [Object, dict_service_1.DictService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map