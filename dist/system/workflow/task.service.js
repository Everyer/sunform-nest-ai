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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const flow_instance_entity_1 = require("./entities/flow-instance.entity");
const flow_instance_node_entity_1 = require("./entities/flow-instance-node.entity");
const flow_template_entity_1 = require("./entities/flow-template.entity");
const sequelize_2 = require("sequelize");
let TaskService = class TaskService {
    constructor(instanceModel, nodeModel) {
        this.instanceModel = instanceModel;
        this.nodeModel = nodeModel;
    }
    async findTodo(dto, username) {
        const { pageindex, pagesize, title, templateId, priority } = dto;
        const pendingNodes = await this.nodeModel.findAndCountAll({
            where: {
                assignee: username,
                status: 'pending',
            },
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: flow_instance_entity_1.FlowInstance,
                    where: { status: 'running' },
                    include: [{ model: flow_template_entity_1.FlowTemplate, attributes: ['name', 'category'] }],
                },
            ],
        });
        return {
            list: pendingNodes.rows.map(node => ({
                taskId: node.id,
                instanceId: node.instanceId,
                nodeName: node.nodeName,
                assigneeName: node.assigneeName,
                createdAt: node.createdAt,
                instance: node.instance,
            })),
            total: pendingNodes.count,
        };
    }
    async findDone(dto, username) {
        const { pageindex, pagesize, title } = dto;
        const doneNodes = await this.nodeModel.findAndCountAll({
            where: {
                assignee: username,
                status: { [sequelize_2.Op.in]: ['approved', 'rejected', 'transferred'] },
            },
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['finishedAt', 'DESC']],
            include: [
                {
                    model: flow_instance_entity_1.FlowInstance,
                    include: [{ model: flow_template_entity_1.FlowTemplate, attributes: ['name', 'category'] }],
                },
            ],
        });
        return {
            list: doneNodes.rows.map(node => ({
                taskId: node.id,
                instanceId: node.instanceId,
                nodeName: node.nodeName,
                status: node.status,
                comment: node.comment,
                finishedAt: node.finishedAt,
                durationSeconds: node.durationSeconds,
                instance: node.instance,
            })),
            total: doneNodes.count,
        };
    }
    async detail(instanceId, nodeId) {
        const instance = await this.instanceModel.findByPk(instanceId, {
            include: [
                { model: flow_template_entity_1.FlowTemplate, attributes: ['id', 'name', 'code'] },
                { model: flow_instance_node_entity_1.FlowInstanceNode, order: [['createdAt', 'ASC']] },
            ],
        });
        if (!instance)
            return null;
        const currentNode = instance.nodes.find(n => n.id === nodeId);
        return { instance, currentNode };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(flow_instance_entity_1.FlowInstance)),
    __param(1, (0, sequelize_1.InjectModel)(flow_instance_node_entity_1.FlowInstanceNode)),
    __metadata("design:paramtypes", [Object, Object])
], TaskService);
//# sourceMappingURL=task.service.js.map