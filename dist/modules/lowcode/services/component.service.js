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
exports.ComponentService = void 0;
const common_1 = require("@nestjs/common");
const component_entity_1 = require("../entities/component.entity");
const project_entity_1 = require("../entities/project.entity");
const page_entity_1 = require("../entities/page.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../../common/exceptions/business.exception");
const user_entity_1 = require("../../../system/user/entities/user.entity");
const staff_entity_1 = require("../../../system/staff/entities/staff.entity");
const sequelize_2 = require("sequelize");
let ComponentService = class ComponentService {
    constructor(model) {
        this.model = model;
    }
    async create(createDto) {
        const existingComponent = await this.model.findOne({
            where: {
                componentCode: createDto.componentCode
            }
        });
        if (existingComponent) {
            throw new business_exception_1.BusinessException('组件代码已存在');
        }
        return this.model.create(createDto);
    }
    async findPageList(dto) {
        const { pageindex, pagesize, componentName, componentCode, componentType, projectId, pageId, isEnable, createBy } = dto;
        const where = {};
        if (componentName) {
            where.componentName = { [sequelize_2.Op.like]: `%${componentName}%` };
        }
        if (componentCode) {
            where.componentCode = { [sequelize_2.Op.like]: `%${componentCode}%` };
        }
        if (createBy) {
            where.createBy = createBy;
        }
        if (projectId) {
            where.projectId = projectId;
        }
        if (pageId) {
            where.pageId = pageId;
        }
        if (componentType) {
            where.componentType = componentType;
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
                },
                {
                    model: page_entity_1.Page,
                    attributes: ['pageName']
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
    findAll() {
        return this.model.findAll({
            include: [
                {
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                },
                {
                    model: page_entity_1.Page,
                    attributes: ['pageName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id, {
            include: [
                {
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                },
                {
                    model: page_entity_1.Page,
                    attributes: ['pageName']
                }
            ]
        });
    }
    async update(dto, user) {
        const { id, componentCode } = dto;
        if (!user.roles.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03')) {
            const alreadyCreatedUser = await this.model.findOne({
                where: {
                    id: id
                },
                attributes: ['createBy', 'operatorIds'],
                raw: true
            });
            if (alreadyCreatedUser?.createBy) {
                const isCreator = dto.createBy === alreadyCreatedUser.createBy;
                if (!isCreator) {
                    throw new business_exception_1.BusinessException('您没有权限修改该组件');
                }
            }
        }
        const existingComponent = await this.model.findOne({
            where: {
                componentCode,
                id: { [sequelize_2.Op.ne]: id }
            }
        });
        if (existingComponent) {
            throw new business_exception_1.BusinessException('组件代码已存在');
        }
        return this.model.update(dto, {
            where: {
                id
            }
        });
    }
    async remove(id, user) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        const isAdmin = user.roles?.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
        if (!isAdmin) {
            throw new business_exception_1.BusinessException('只有管理员才能删除组件');
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
    async findComponentById(id) {
        let res = await this.model.findByPk(id, {
            include: [
                {
                    model: project_entity_1.Project,
                    attributes: ['projectName']
                },
                {
                    model: page_entity_1.Page,
                    attributes: ['pageName']
                }
            ]
        });
        if (res) {
            return res.componentConfig;
        }
        else {
            throw new business_exception_1.BusinessException('组件不存在');
        }
    }
    async findComponentByComponentCode(componentCode) {
        let res = await this.model.findOne({
            where: {
                componentCode
            }
        });
        if (res) {
            return res.componentConfig;
        }
        else {
            throw new business_exception_1.BusinessException('组件不存在');
        }
    }
    findByPageId(pageId) {
        return this.model.findAll({
            where: {
                pageId,
                isEnable: true,
            },
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ['componentConfig']
            },
            include: [{
                    model: user_entity_1.User,
                    attributes: ['username'],
                    include: [{
                            model: staff_entity_1.Staff,
                            attributes: ['staffName']
                        }]
                }]
        });
    }
    findByProjectId(projectId) {
        return this.model.findAll({
            where: {
                projectId,
                isEnable: true
            },
            include: [{
                    model: page_entity_1.Page,
                    attributes: ['pageName']
                }],
            order: [['createdAt', 'DESC']]
        });
    }
    async getConfigByOtherProject(dto) {
        const { projectId, componentId, componentCode } = dto;
        if (!projectId) {
            throw new business_exception_1.BusinessException('缺少项目秘钥');
        }
        if (!componentId && !componentCode) {
            throw new business_exception_1.BusinessException('缺少组件秘钥');
        }
        const where = {
            projectId
        };
        if (componentId) {
            where.id = componentId;
        }
        if (componentCode) {
            where.componentCode = componentCode;
        }
        const component = await this.model.findOne({
            where,
            attributes: ['componentConfig', 'componentCode', 'componentName', 'id']
        });
        if (!component) {
            throw new business_exception_1.BusinessException('获取失败');
        }
        return component;
    }
    async updateOperators(id, operatorIds, user) {
        if (!id) {
            throw new business_exception_1.BusinessException('组件ID不能为空');
        }
        const component = await this.model.findByPk(id, {
            attributes: ['id', 'createBy', 'operatorIds']
        });
        if (!component) {
            throw new business_exception_1.BusinessException('组件不存在');
        }
        const isAdmin = user.roles.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
        const isCreator = component.createBy === user.id;
        if (!isAdmin && !isCreator) {
            throw new business_exception_1.BusinessException('您没有权限修改该组件的可操作人');
        }
        if (!operatorIds || operatorIds.length === 0) {
            throw new business_exception_1.BusinessException('可操作人不能为空');
        }
        await this.model.update({ createBy: operatorIds[0] }, { where: { id } });
        return true;
    }
};
exports.ComponentService = ComponentService;
exports.ComponentService = ComponentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(component_entity_1.Component)),
    __metadata("design:paramtypes", [Object])
], ComponentService);
//# sourceMappingURL=component.service.js.map