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
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const flow_template_entity_1 = require("./entities/flow-template.entity");
const flow_template_node_entity_1 = require("./entities/flow-template-node.entity");
const flow_template_edge_entity_1 = require("./entities/flow-template-edge.entity");
const flow_node_permission_entity_1 = require("./entities/flow-node-permission.entity");
const business_exception_1 = require("../../common/exceptions/business.exception");
let TemplateService = class TemplateService {
    constructor(templateModel, nodeModel, edgeModel, permissionModel) {
        this.templateModel = templateModel;
        this.nodeModel = nodeModel;
        this.edgeModel = edgeModel;
        this.permissionModel = permissionModel;
    }
    async create(dto) {
        const { nodes, edges, nodePermissions, ...templateData } = dto;
        const template = await this.templateModel.create(templateData);
        if (nodes?.length) {
            await this.nodeModel.bulkCreate(nodes.map((n) => ({ ...n, templateId: template.id })));
        }
        if (edges?.length) {
            await this.edgeModel.bulkCreate(edges.map((e) => ({ ...e, templateId: template.id })));
        }
        if (nodePermissions?.length) {
            await this.permissionModel.bulkCreate(nodePermissions.map((p) => ({ ...p, templateId: template.id })));
        }
        return template;
    }
    async update(dto) {
        const { id, nodes, edges, nodePermissions, ...rest } = dto;
        const template = await this.templateModel.findByPk(id);
        if (!template)
            throw new business_exception_1.BusinessException('模板不存在');
        const transaction = await this.templateModel.sequelize.transaction();
        try {
            await template.update(rest, { transaction });
            if (nodes !== undefined) {
                const existingNodes = await this.nodeModel.findAll({ where: { templateId: id }, transaction });
                const existingNodeIds = existingNodes.map(n => n.id);
                const incomingNodeIds = nodes.map(n => n.id).filter(Boolean);
                const nodeIdsToDelete = existingNodeIds.filter(nid => !incomingNodeIds.includes(nid));
                if (nodeIdsToDelete.length > 0) {
                    try {
                        await this.nodeModel.destroy({ where: { id: nodeIdsToDelete, templateId: id }, transaction });
                    }
                    catch (err) {
                        throw new business_exception_1.BusinessException('无法删除已在流程实例中使用的节点，请先删除相关流程实例');
                    }
                }
                for (const n of nodes) {
                    if (n.id && existingNodeIds.includes(n.id)) {
                        await this.nodeModel.update({ ...n, templateId: id }, { where: { id: n.id }, transaction });
                    }
                    else {
                        await this.nodeModel.create({ ...n, templateId: id }, { transaction });
                    }
                }
            }
            if (edges !== undefined) {
                await this.edgeModel.destroy({ where: { templateId: id }, transaction });
                if (edges.length) {
                    await this.edgeModel.bulkCreate(edges.map(e => ({ ...e, templateId: id })), { transaction });
                }
            }
            if (nodePermissions !== undefined) {
                await this.permissionModel.destroy({ where: { templateId: id }, transaction });
                if (nodePermissions.length) {
                    await this.permissionModel.bulkCreate(nodePermissions.map(p => ({ ...p, templateId: id })), { transaction });
                }
            }
            await transaction.commit();
            return template;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async findPageList(dto) {
        const { pageindex, pagesize, name, category, status } = dto;
        const where = {};
        if (name)
            where.name = name;
        if (category)
            where.category = category;
        if (status !== undefined)
            where.status = status;
        const { rows, count } = await this.templateModel.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['createdAt', 'DESC']],
        });
        return { list: rows, total: count };
    }
    async findAll() {
        return this.templateModel.findAll({ where: { status: 1 }, order: [['createdAt', 'DESC']] });
    }
    async findOne(id) {
        const template = await this.templateModel.findByPk(id, {
            include: [
                { model: flow_template_node_entity_1.FlowTemplateNode, order: [['order', 'ASC']] },
                { model: flow_template_edge_entity_1.FlowTemplateEdge },
                { model: flow_node_permission_entity_1.FlowNodePermission },
            ],
        });
        if (!template)
            throw new business_exception_1.BusinessException('模板不存在');
        return template;
    }
    async publish(id) {
        const template = await this.templateModel.findByPk(id);
        if (!template)
            throw new business_exception_1.BusinessException('模板不存在');
        if (template.status !== 0 && template.status !== 2)
            throw new business_exception_1.BusinessException('仅草稿或已停用状态可发布');
        await template.update({ status: 1, version: template.version + 1 });
        return template;
    }
    async deactivate(id) {
        const template = await this.templateModel.findByPk(id);
        if (!template)
            throw new business_exception_1.BusinessException('模板不存在');
        await template.update({ status: 2 });
        return template;
    }
    async remove(id) {
        const template = await this.templateModel.findByPk(id);
        if (!template)
            throw new business_exception_1.BusinessException('模板不存在');
        await this.edgeModel.destroy({ where: { templateId: id } });
        await this.permissionModel.destroy({ where: { templateId: id } });
        await this.nodeModel.destroy({ where: { templateId: id } });
        await template.destroy();
        return true;
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(flow_template_entity_1.FlowTemplate)),
    __param(1, (0, sequelize_1.InjectModel)(flow_template_node_entity_1.FlowTemplateNode)),
    __param(2, (0, sequelize_1.InjectModel)(flow_template_edge_entity_1.FlowTemplateEdge)),
    __param(3, (0, sequelize_1.InjectModel)(flow_node_permission_entity_1.FlowNodePermission)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TemplateService);
//# sourceMappingURL=template.service.js.map