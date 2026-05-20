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
exports.InstanceService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const flow_instance_entity_1 = require("./entities/flow-instance.entity");
const flow_instance_node_entity_1 = require("./entities/flow-instance-node.entity");
const flow_instance_data_entity_1 = require("./entities/flow-instance-data.entity");
const flow_template_entity_1 = require("./entities/flow-template.entity");
const flow_template_node_entity_1 = require("./entities/flow-template-node.entity");
const flow_template_edge_entity_1 = require("./entities/flow-template-edge.entity");
const flow_node_permission_entity_1 = require("./entities/flow-node-permission.entity");
const business_exception_1 = require("../../common/exceptions/business.exception");
const node_executor_service_1 = require("./node-executor.service");
let InstanceService = class InstanceService {
    constructor(instanceModel, instanceNodeModel, instanceDataModel, templateModel, templateNodeModel, templateEdgeModel, permissionModel, nodeExecutorService, sequelize) {
        this.instanceModel = instanceModel;
        this.instanceNodeModel = instanceNodeModel;
        this.instanceDataModel = instanceDataModel;
        this.templateModel = templateModel;
        this.templateNodeModel = templateNodeModel;
        this.templateEdgeModel = templateEdgeModel;
        this.permissionModel = permissionModel;
        this.nodeExecutorService = nodeExecutorService;
        this.sequelize = sequelize;
    }
    async start(dto, username) {
        if (dto.instanceId) {
            const existing = await this.instanceModel.findByPk(dto.instanceId);
            if (!existing)
                throw new business_exception_1.BusinessException('流程实例不存在');
            if (existing.status !== 'draft')
                throw new business_exception_1.BusinessException('仅草稿状态的实例可编辑');
            await existing.update({
                title: dto.title || existing.title,
                priority: dto.priority ?? existing.priority,
                dueDate: dto.dueDate ?? existing.dueDate,
            });
            const lastData = await this.instanceDataModel.findOne({
                where: { instanceId: existing.id },
                order: [['dataVersion', 'DESC']],
            });
            await this.instanceDataModel.create({
                instanceId: existing.id,
                nodeId: null,
                data: dto.formData,
                dataVersion: (lastData?.dataVersion || 0) + 1,
            });
            if (!dto.draft) {
                const template = await this.templateModel.findByPk(dto.templateId, {
                    include: [
                        { model: flow_template_node_entity_1.FlowTemplateNode, order: [['order', 'ASC']] },
                        { model: flow_template_edge_entity_1.FlowTemplateEdge },
                    ],
                });
                if (!template)
                    throw new business_exception_1.BusinessException('流程模板不存在');
                if (template.status !== 1)
                    throw new business_exception_1.BusinessException('流程模板未发布');
                const startNode = template.nodes.find(n => n.type === 'start');
                if (!startNode)
                    throw new business_exception_1.BusinessException('模板缺少开始节点');
                const transaction = await this.sequelize.transaction();
                try {
                    await existing.update({ status: 'running' }, { transaction });
                    const firstEdge = template.edges.find(e => e.sourceNodeId === startNode.id);
                    if (!firstEdge)
                        throw new business_exception_1.BusinessException('模板缺少流程连线');
                    await this.createNextNode(existing.id, firstEdge.targetNodeId, template, transaction);
                    await transaction.commit();
                }
                catch (e) {
                    await transaction.rollback();
                    throw e;
                }
            }
            return existing.reload();
        }
        const template = await this.templateModel.findByPk(dto.templateId, {
            include: [
                { model: flow_template_node_entity_1.FlowTemplateNode, order: [['order', 'ASC']] },
                { model: flow_template_edge_entity_1.FlowTemplateEdge },
            ],
        });
        if (!template)
            throw new business_exception_1.BusinessException('流程模板不存在');
        if (template.status !== 1)
            throw new business_exception_1.BusinessException('流程模板未发布');
        if (dto.draft) {
            const instance = await this.instanceModel.create({
                templateId: template.id,
                templateVersion: template.version,
                formDefId: template.formDefId,
                title: dto.title || '草稿',
                status: 'draft',
                initiator: username,
                priority: dto.priority || 0,
                dueDate: dto.dueDate || null,
                currentNodeIds: [],
            });
            await this.instanceDataModel.create({
                instanceId: instance.id,
                nodeId: null,
                data: dto.formData,
                dataVersion: 1,
            });
            return instance;
        }
        const startNode = template.nodes.find(n => n.type === 'start');
        if (!startNode)
            throw new business_exception_1.BusinessException('模板缺少开始节点');
        const transaction = await this.sequelize.transaction();
        try {
            const instance = await this.instanceModel.create({
                templateId: template.id,
                templateVersion: template.version,
                formDefId: template.formDefId,
                title: dto.title,
                status: 'running',
                initiator: username,
                priority: dto.priority || 0,
                dueDate: dto.dueDate || null,
                currentNodeIds: [],
            }, { transaction });
            await this.instanceDataModel.create({
                instanceId: instance.id,
                nodeId: null,
                data: dto.formData,
                dataVersion: 1,
            }, { transaction });
            const firstEdge = template.edges.find(e => e.sourceNodeId === startNode.id);
            if (!firstEdge)
                throw new business_exception_1.BusinessException('模板缺少流程连线');
            await this.createNextNode(instance.id, firstEdge.targetNodeId, template, transaction);
            await transaction.commit();
            return instance;
        }
        catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
    async approve(dto, username) {
        const instance = await this.instanceModel.findByPk(dto.instanceId, {
            include: [{ model: flow_template_entity_1.FlowTemplate }, 'nodes'],
        });
        if (!instance)
            throw new business_exception_1.BusinessException('流程实例不存在');
        if (instance.status !== 'running')
            throw new business_exception_1.BusinessException('流程已结束');
        const currentNode = await this.instanceNodeModel.findOne({
            where: { instanceId: instance.id, id: dto.nodeId, status: 'pending' },
        });
        if (!currentNode)
            throw new business_exception_1.BusinessException('当前节点不存在或已处理');
        if (currentNode.assignee !== username)
            throw new business_exception_1.BusinessException('您不是当前节点的审批人');
        if (dto.action === 'agree') {
            return this.handleAgree(instance, currentNode, dto, username);
        }
        else if (dto.action === 'reject') {
            return this.handleReject(instance, currentNode, dto, username);
        }
        else if (dto.action === 'transfer') {
            return this.handleTransfer(instance, currentNode, dto, username);
        }
        throw new business_exception_1.BusinessException('不支持的操作');
    }
    async handleAgree(instance, node, dto, username) {
        const transaction = await this.sequelize.transaction();
        try {
            await node.update({
                status: 'approved',
                comment: dto.comment || '同意',
                attachments: dto.attachments || null,
                finishedAt: new Date(),
                durationSeconds: Math.floor((Date.now() - new Date(node.startedAt || node.createdAt).getTime()) / 1000),
            }, { transaction });
            if (dto.formData) {
                const lastData = await this.instanceDataModel.findOne({
                    where: { instanceId: instance.id },
                    order: [['dataVersion', 'DESC']],
                });
                await this.instanceDataModel.create({
                    instanceId: instance.id,
                    nodeId: node.id,
                    data: dto.formData,
                    dataVersion: (lastData?.dataVersion || 1) + 1,
                }, { transaction });
            }
            const template = await this.templateModel.findByPk(instance.templateId, {
                include: [
                    { model: flow_template_node_entity_1.FlowTemplateNode, order: [['order', 'ASC']] },
                    { model: flow_template_edge_entity_1.FlowTemplateEdge },
                ],
            });
            if (!template)
                throw new business_exception_1.BusinessException('模板不存在');
            const edge = template.edges?.find(e => e.sourceNodeId === node.templateNodeId);
            if (edge) {
                await this.createNextNode(instance.id, edge.targetNodeId, template, transaction);
            }
            else {
                await instance.update({ status: 'approved', finishedAt: new Date(), currentNodeIds: [] }, { transaction });
            }
            await transaction.commit();
            return { success: true, message: '审批通过' };
        }
        catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
    async handleReject(instance, node, dto, username) {
        const transaction = await this.sequelize.transaction();
        try {
            await node.update({
                status: 'rejected',
                comment: dto.comment || '驳回',
                finishedAt: new Date(),
                durationSeconds: Math.floor((Date.now() - new Date(node.startedAt || node.createdAt).getTime()) / 1000),
            }, { transaction });
            const startNodeInstance = await this.instanceNodeModel.create({
                instanceId: instance.id,
                templateNodeId: node.templateNodeId,
                nodeName: '发起人(驳回)',
                nodeType: 'start',
                status: 'pending',
                assignee: instance.initiator,
                assigneeName: instance.initiator,
            }, { transaction });
            await instance.update({ status: 'rejected', currentNodeIds: [startNodeInstance.id], finishedAt: new Date() }, { transaction });
            await transaction.commit();
            return { success: true, message: '已驳回' };
        }
        catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
    async handleTransfer(instance, node, dto, username) {
        if (!dto.transferTo)
            throw new business_exception_1.BusinessException('转交时必须指定目标人');
        await node.update({ assignee: dto.transferTo, comment: `由 ${username} 转交` });
        return { success: true, message: '已转交' };
    }
    async createNextNode(instanceId, targetNodeId, template, transaction) {
        const templateNode = template.nodes.find(n => n.id === targetNodeId);
        if (!templateNode)
            throw new business_exception_1.BusinessException('模板节点不存在');
        if (templateNode.type === 'end') {
            await this.instanceModel.update({ status: 'approved', currentNodeIds: [], finishedAt: new Date() }, { where: { id: instanceId }, transaction });
            return;
        }
        const assignee = await this.nodeExecutorService.resolveAssignee(templateNode, instanceId, transaction);
        const node = await this.instanceNodeModel.create({
            instanceId,
            templateNodeId: templateNode.id,
            nodeName: templateNode.name,
            nodeType: templateNode.type,
            status: 'pending',
            assignee,
            assigneeName: assignee,
        }, { transaction });
        const instance = await this.instanceModel.findByPk(instanceId);
        if (!instance)
            return;
        const currentIds = (instance.currentNodeIds || []);
        currentIds.push(node.id);
        await instance.update({ currentNodeIds: currentIds }, { transaction });
    }
    async withdraw(instanceId, username) {
        const instance = await this.instanceModel.findByPk(instanceId);
        if (!instance)
            throw new business_exception_1.BusinessException('实例不存在');
        if (instance.initiator !== username)
            throw new business_exception_1.BusinessException('仅发起人可撤回');
        if (instance.status !== 'running')
            throw new business_exception_1.BusinessException('仅审批中的流程可撤回');
        await instance.update({ status: 'cancelled', finishedAt: new Date(), currentNodeIds: [] });
        await this.instanceNodeModel.update({ status: 'cancelled' }, { where: { instanceId, status: 'pending' } });
        return { success: true, message: '已撤回' };
    }
    async findPageList(dto, username) {
        const { pageindex, pagesize, title, status, templateId } = dto;
        const where = { initiator: username };
        if (title)
            where.title = title;
        if (status)
            where.status = status;
        if (templateId)
            where.templateId = templateId;
        const { rows, count } = await this.instanceModel.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['createdAt', 'DESC']],
            include: [{ model: flow_template_entity_1.FlowTemplate, attributes: ['name'] }],
        });
        return { list: rows, total: count };
    }
    async findOne(id) {
        const instance = await this.instanceModel.findByPk(id, {
            include: [
                {
                    model: flow_template_entity_1.FlowTemplate,
                    attributes: ['id', 'name', 'code', 'config'],
                    include: [
                        { model: flow_template_node_entity_1.FlowTemplateNode, order: [['order', 'ASC']] },
                        { model: flow_template_edge_entity_1.FlowTemplateEdge },
                    ],
                },
                {
                    model: flow_instance_node_entity_1.FlowInstanceNode,
                    order: [['createdAt', 'ASC']],
                },
            ],
        });
        if (!instance)
            throw new business_exception_1.BusinessException('实例不存在');
        const dataSnapshots = await this.instanceDataModel.findAll({
            where: { instanceId: id },
            order: [['dataVersion', 'DESC']],
        });
        const permissions = await this.permissionModel.findAll({
            where: { templateId: instance.templateId },
        });
        const result = instance.toJSON();
        result.formTemplate = instance.template?.config?.formTemplate || '';
        result.nodePermissions = permissions;
        result.dataSnapshots = dataSnapshots;
        return result;
    }
};
exports.InstanceService = InstanceService;
exports.InstanceService = InstanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(flow_instance_entity_1.FlowInstance)),
    __param(1, (0, sequelize_1.InjectModel)(flow_instance_node_entity_1.FlowInstanceNode)),
    __param(2, (0, sequelize_1.InjectModel)(flow_instance_data_entity_1.FlowInstanceData)),
    __param(3, (0, sequelize_1.InjectModel)(flow_template_entity_1.FlowTemplate)),
    __param(4, (0, sequelize_1.InjectModel)(flow_template_node_entity_1.FlowTemplateNode)),
    __param(5, (0, sequelize_1.InjectModel)(flow_template_edge_entity_1.FlowTemplateEdge)),
    __param(6, (0, sequelize_1.InjectModel)(flow_node_permission_entity_1.FlowNodePermission)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, node_executor_service_1.NodeExecutorService,
        sequelize_typescript_1.Sequelize])
], InstanceService);
//# sourceMappingURL=instance.service.js.map