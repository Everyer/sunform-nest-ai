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
exports.PageService = void 0;
const common_1 = require("@nestjs/common");
const page_entity_1 = require("../entities/page.entity");
const project_entity_1 = require("../entities/project.entity");
const component_entity_1 = require("../entities/component.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../../common/exceptions/business.exception");
const user_entity_1 = require("../../../system/user/entities/user.entity");
const staff_entity_1 = require("../../../system/staff/entities/staff.entity");
const sequelize_2 = require("sequelize");
let PageService = class PageService {
    constructor(model) {
        this.model = model;
    }
    async create(createDto) {
        return this.model.create(createDto);
    }
    async findPageList(dto) {
        const { pageindex, pagesize, pageName, projectId, isEnable, createBy } = dto;
        const where = {};
        if (pageName) {
            where.pageName = { [sequelize_2.Op.like]: `%${pageName}%` };
        }
        if (createBy) {
            where.createBy = createBy;
        }
        if (projectId) {
            where.projectId = projectId;
        }
        if (isEnable !== undefined) {
            where.isEnable = isEnable;
        }
        const { rows, count } = await this.model.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            include: [
                {
                    model: user_entity_1.User,
                    attributes: ['username'],
                    include: [{
                            model: staff_entity_1.Staff,
                            attributes: ['staffName']
                        }]
                },
                {
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll(userid) {
        return this.model.findAll({
            include: [{
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                }],
            order: [['createdAt', 'DESC']],
            where: {
                createBy: userid
            }
        });
    }
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id, {
            include: [{
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                }]
        });
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
        const componentCount = await component_entity_1.Component.count({
            where: {
                pageId: id
            }
        });
        if (componentCount > 0) {
            throw new business_exception_1.BusinessException(`该页面下有 ${componentCount} 个组件,无法删除`);
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
    findByProjectId(projectId) {
        return this.model.findAll({
            where: {
                projectId,
                isEnable: true
            },
            order: [['createdAt', 'DESC']]
        });
    }
};
exports.PageService = PageService;
exports.PageService = PageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(page_entity_1.Page)),
    __metadata("design:paramtypes", [Object])
], PageService);
//# sourceMappingURL=page.service.js.map