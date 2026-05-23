import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowInstanceNode } from './entities/flow-instance-node.entity';
import { FlowInstanceData } from './entities/flow-instance-data.entity';
import { FlowTemplate } from './entities/flow-template.entity';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowTemplateEdge } from './entities/flow-template-edge.entity';
import { FlowNodePermission } from './entities/flow-node-permission.entity';
import { StartInstanceDto, ApproveInstanceDto, InstancePageListDto } from './dto/instance.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { NodeExecutorService } from './node-executor.service';

@Injectable()
export class InstanceService {
  constructor(
    @InjectModel(FlowInstance) private instanceModel: typeof FlowInstance,
    @InjectModel(FlowInstanceNode) private instanceNodeModel: typeof FlowInstanceNode,
    @InjectModel(FlowInstanceData) private instanceDataModel: typeof FlowInstanceData,
    @InjectModel(FlowTemplate) private templateModel: typeof FlowTemplate,
    @InjectModel(FlowTemplateNode) private templateNodeModel: typeof FlowTemplateNode,
    @InjectModel(FlowTemplateEdge) private templateEdgeModel: typeof FlowTemplateEdge,
    @InjectModel(FlowNodePermission) private permissionModel: typeof FlowNodePermission,
    private nodeExecutorService: NodeExecutorService,
    private sequelize: Sequelize,
  ) {}

  async start(dto: StartInstanceDto, username: string) {
    // 编辑已有草稿：更新草稿数据和表单，不进入审批流
    if (dto.instanceId) {
      const existing = await this.instanceModel.findByPk(dto.instanceId);
      if (!existing) throw new BusinessException('流程实例不存在');
      if (existing.status !== 'draft') throw new BusinessException('仅草稿状态的实例可编辑');

      await existing.update({
        title: dto.title || existing.title,
        priority: dto.priority ?? existing.priority,
        dueDate: dto.dueDate ?? existing.dueDate,
      } as any);

      const lastData = await this.instanceDataModel.findOne({
        where: { instanceId: existing.id },
        order: [['dataVersion', 'DESC']],
      });
      await this.instanceDataModel.create({
        instanceId: existing.id,
        nodeId: null,
        data: dto.formData,
        dataVersion: (lastData?.dataVersion || 0) + 1,
      } as any);

      // 如果非草稿模式（提交草稿），进入审批流
      if (!dto.draft) {
        const template = await this.templateModel.findByPk(dto.templateId, {
          include: [
            { model: FlowTemplateNode, order: [['order', 'ASC']] },
            { model: FlowTemplateEdge },
          ],
        });
        if (!template) throw new BusinessException('流程模板不存在');
        if (template.status !== 1) throw new BusinessException('流程模板未发布');

        const startNode = template.nodes.find(n => n.type === 'start');
        if (!startNode) throw new BusinessException('模板缺少开始节点');

        const transaction = await this.sequelize.transaction();
        try {
          await existing.update({ status: 'running' } as any, { transaction });

          const nextNodeId = await this.getNextExecutableNodeId(startNode.id, template, existing.id, transaction);
          if (nextNodeId) {
            await this.createNextNode(existing.id, nextNodeId, template, transaction);
          } else {
            await existing.update({ status: 'approved', finishedAt: new Date(), currentNodeIds: [] } as any, { transaction });
          }
          await transaction.commit();
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
      }

      return existing.reload();
    }

    const template = await this.templateModel.findByPk(dto.templateId, {
      include: [
        { model: FlowTemplateNode, order: [['order', 'ASC']] },
        { model: FlowTemplateEdge },
      ],
    });
    if (!template) throw new BusinessException('流程模板不存在');
    if (template.status !== 1) throw new BusinessException('流程模板未发布');

    // 保存草稿：仅创建实例和表单数据，不进入审批流
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
      } as any);

      await this.instanceDataModel.create({
        instanceId: instance.id,
        nodeId: null,
        data: dto.formData,
        dataVersion: 1,
      } as any);

      return instance;
    }

    const startNode = template.nodes.find(n => n.type === 'start');
    if (!startNode) throw new BusinessException('模板缺少开始节点');

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
      } as any, { transaction });

      // 写入表单数据
      await this.instanceDataModel.create({
        instanceId: instance.id,
        nodeId: null,
        data: dto.formData,
        dataVersion: 1,
      } as any, { transaction });

      const nextNodeId = await this.getNextExecutableNodeId(startNode.id, template, instance.id, transaction);
      if (nextNodeId) {
        await this.createNextNode(instance.id, nextNodeId, template, transaction);
      } else {
        await instance.update({ status: 'approved', finishedAt: new Date(), currentNodeIds: [] } as any, { transaction });
      }

      await transaction.commit();
      return instance;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async approve(dto: ApproveInstanceDto, username: string) {
    const instance = await this.instanceModel.findByPk(dto.instanceId, {
      include: [{ model: FlowTemplate }, 'nodes'],
    });
    if (!instance) throw new BusinessException('流程实例不存在');
    if (instance.status !== 'running') throw new BusinessException('流程已结束');

    const currentNode = await this.instanceNodeModel.findOne({
      where: { instanceId: instance.id, id: dto.nodeId, status: 'pending' },
    });
    if (!currentNode) throw new BusinessException('当前节点不存在或已处理');
    if (currentNode.assignee !== username) throw new BusinessException('您不是当前节点的审批人');

    if (dto.action === 'agree') {
      return this.handleAgree(instance, currentNode, dto, username);
    } else if (dto.action === 'reject') {
      return this.handleReject(instance, currentNode, dto, username);
    } else if (dto.action === 'transfer') {
      return this.handleTransfer(instance, currentNode, dto, username);
    }
    throw new BusinessException('不支持的操作');
  }

  private async handleAgree(instance: FlowInstance, node: FlowInstanceNode, dto: ApproveInstanceDto, username: string) {
    const transaction = await this.sequelize.transaction();
    try {
      // 更新当前节点为通过
      await node.update({
        status: 'approved',
        comment: dto.comment || '同意',
        attachments: dto.attachments || null,
        finishedAt: new Date(),
        durationSeconds: Math.floor((Date.now() - new Date(node.startedAt || node.createdAt).getTime()) / 1000),
      } as any, { transaction });

      // 写入表单数据快照
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
        } as any, { transaction });
      }

      // 找下一节点
      const template = await this.templateModel.findByPk(instance.templateId, {
        include: [
          { model: FlowTemplateNode, order: [['order', 'ASC']] },
          { model: FlowTemplateEdge },
        ],
      });

      if (!template) throw new BusinessException('模板不存在');

      const nextNodeId = await this.getNextExecutableNodeId(node.templateNodeId, template, instance.id, transaction);
      if (nextNodeId) {
        await this.createNextNode(instance.id, nextNodeId, template, transaction);
      } else {
        // 最后一个节点，流程结束
        await instance.update({ status: 'approved', finishedAt: new Date(), currentNodeIds: [] } as any, { transaction });
      }

      await transaction.commit();
      return { success: true, message: '审批通过' };
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  private async handleReject(instance: FlowInstance, node: FlowInstanceNode, dto: ApproveInstanceDto, username: string) {
    const transaction = await this.sequelize.transaction();
    try {
      await node.update({
        status: 'rejected',
        comment: dto.comment || '驳回',
        finishedAt: new Date(),
        durationSeconds: Math.floor((Date.now() - new Date(node.startedAt || node.createdAt).getTime()) / 1000),
      } as any, { transaction });

      // 默认为退回到发起人，创建发起人节点
      const startNodeInstance = await this.instanceNodeModel.create({
        instanceId: instance.id,
        templateNodeId: node.templateNodeId,
        nodeName: '发起人(驳回)',
        nodeType: 'start',
        status: 'pending',
        assignee: instance.initiator,
        assigneeName: instance.initiator,
      } as any, { transaction });

      await instance.update({ status: 'rejected', currentNodeIds: [startNodeInstance.id], finishedAt: new Date() } as any, { transaction });
      await transaction.commit();
      return { success: true, message: '已驳回' };
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  private async handleTransfer(instance: FlowInstance, node: FlowInstanceNode, dto: ApproveInstanceDto, username: string) {
    if (!dto.transferTo) throw new BusinessException('转交时必须指定目标人');
    await node.update({ assignee: dto.transferTo, comment: `由 ${username} 转交` } as any);
    return { success: true, message: '已转交' };
  }

  private async createNextNode(instanceId: string, targetNodeId: string, template: FlowTemplate, transaction: any) {
    const templateNode = template.nodes.find(n => n.id === targetNodeId);
    if (!templateNode) throw new BusinessException('模板节点不存在');

    // 如果是结束节点，直接完成
    if (templateNode.type === 'end') {
      await this.instanceModel.update(
        { status: 'approved', currentNodeIds: [], finishedAt: new Date() },
        { where: { id: instanceId }, transaction },
      );
      return;
    }

    // 解析审批人
    const assignee = await this.nodeExecutorService.resolveAssignee(templateNode, instanceId, transaction);

    const node = await this.instanceNodeModel.create({
      instanceId,
      templateNodeId: templateNode.id,
      nodeName: templateNode.name,
      nodeType: templateNode.type,
      status: 'pending',
      assignee,
      assigneeName: assignee,
    } as any, { transaction });

    // 更新实例当前激活节点
    const instance = await this.instanceModel.findByPk(instanceId);
    if (!instance) return;
    const currentIds = (instance.currentNodeIds || []) as string[];
    currentIds.push(node.id);
    await instance.update({ currentNodeIds: currentIds } as any, { transaction });
  }

  async withdraw(instanceId: string, username: string) {
    const instance = await this.instanceModel.findByPk(instanceId);
    if (!instance) throw new BusinessException('实例不存在');
    if (instance.initiator !== username) throw new BusinessException('仅发起人可撤回');
    if (instance.status !== 'running') throw new BusinessException('仅审批中的流程可撤回');

    await instance.update({ status: 'cancelled', finishedAt: new Date(), currentNodeIds: [] } as any);
    await this.instanceNodeModel.update(
      { status: 'cancelled' } as any,
      { where: { instanceId, status: 'pending' } },
    );
    return { success: true, message: '已撤回' };
  }

  async findPageList(dto: InstancePageListDto, username: string) {
    const { pageindex, pagesize, title, status, templateId } = dto;
    const where: any = { initiator: username };
    if (title) where.title = title;
    if (status) where.status = status;
    if (templateId) where.templateId = templateId;

    const { rows, count } = await this.instanceModel.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['createdAt', 'DESC']],
      include: [{ model: FlowTemplate, attributes: ['name'] }],
    });
    return { list: rows, total: count };
  }

  async findOne(id: string) {
    const instance = await this.instanceModel.findByPk(id, {
      include: [
        {
          model: FlowTemplate,
          attributes: ['id', 'name', 'code', 'config'],
          include: [
            { model: FlowTemplateNode, order: [['order', 'ASC']] },
            { model: FlowTemplateEdge },
          ],
        },
        {
          model: FlowInstanceNode,
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    if (!instance) throw new BusinessException('实例不存在');

    // 单独查询 formData（绕过 HasMany to FlowInstanceData 的多 FK 歧义）
    const dataSnapshots = await this.instanceDataModel.findAll({
      where: { instanceId: id },
      order: [['dataVersion', 'DESC']],
    });

    // 获取节点字段权限
    const permissions = await this.permissionModel.findAll({
      where: { templateId: instance.templateId },
    });

    const result: any = instance.toJSON();
    result.formTemplate = instance.template?.config?.formTemplate || '';
    result.nodePermissions = permissions;
    result.dataSnapshots = dataSnapshots;
    return result;
  }

  private evaluateCondition(condition: any, formData: any): boolean {
    if (!condition) return true;
    
    if (typeof condition === 'string') {
      if (condition === 'else' || condition === 'other') {
        return false;
      }
      const match = condition.match(/^\s*([a-zA-Z0-9_]+)\s*([>=<!]+|contains|not_contains)\s*(.+)$/);
      if (match) {
        const field = match[1];
        const operator = match[2];
        const value = match[3].trim().replace(/^['"]|['"]$/g, '');
        const formValue = formData[field];
        return this.compareValues(formValue, operator, value);
      }
      return false;
    }

    if (condition.isDefault) return false;

    const { logicalOp, rules } = condition;
    if (!rules || !Array.isArray(rules) || rules.length === 0) return true;

    const results = rules.map(rule => {
      const { field, operator, value } = rule;
      const formValue = formData[field];
      return this.compareValues(formValue, operator, value);
    });

    if (logicalOp === 'or') {
      return results.some(r => r);
    } else {
      return results.every(r => r);
    }
  }

  private compareValues(formValue: any, operator: string, targetValue: any): boolean {
    const numForm = Number(formValue);
    const numTarget = Number(targetValue);
    const isNumeric = !isNaN(numForm) && !isNaN(numTarget) && formValue !== '' && targetValue !== '' && formValue !== null && targetValue !== null;

    switch (operator) {
      case '==':
        return formValue == targetValue;
      case '!=':
        return formValue != targetValue;
      case '>':
        return isNumeric ? numForm > numTarget : String(formValue) > String(targetValue);
      case '>=':
        return isNumeric ? numForm >= numTarget : String(formValue) >= String(targetValue);
      case '<':
        return isNumeric ? numForm < numTarget : String(formValue) < String(targetValue);
      case '<=':
        return isNumeric ? numForm <= numTarget : String(formValue) <= String(targetValue);
      case 'contains':
        return typeof formValue === 'string' && formValue.includes(targetValue);
      case 'not_contains':
        return typeof formValue === 'string' && !formValue.includes(targetValue);
      case 'empty':
        return formValue === undefined || formValue === null || formValue === '';
      case 'not_empty':
        return formValue !== undefined && formValue !== null && formValue !== '';
      default:
        return false;
    }
  }

  private async getNextExecutableNodeId(
    sourceNodeId: string,
    template: FlowTemplate,
    instanceId: string,
    transaction?: any,
  ): Promise<string | null> {
    const outgoingEdges = template.edges.filter(e => e.sourceNodeId === sourceNodeId);
    if (outgoingEdges.length === 0) return null;

    if (outgoingEdges.length === 1) {
      const nextNode = template.nodes.find(n => n.id === outgoingEdges[0].targetNodeId);
      if (!nextNode) return null;
      if (nextNode.type === 'condition') {
        return this.getNextExecutableNodeId(nextNode.id, template, instanceId, transaction);
      }
      return nextNode.id;
    }

    const lastData = await this.instanceDataModel.findOne({
      where: { instanceId },
      order: [['dataVersion', 'DESC']],
      transaction,
    });
    const formData = lastData?.data || {};

    const sortedEdges = [...outgoingEdges].sort((a, b) => {
      const aCond = typeof a.condition === 'string' ? { isDefault: a.condition === 'else' || a.condition === 'other' } : a.condition;
      const bCond = typeof b.condition === 'string' ? { isDefault: b.condition === 'else' || b.condition === 'other' } : b.condition;
      const aIsDefault = aCond?.isDefault || false;
      const bIsDefault = bCond?.isDefault || false;
      return (aIsDefault ? 1 : 0) - (bIsDefault ? 1 : 0);
    });

    let matchedTargetNodeId: string | null = null;
    let defaultTargetNodeId: string | null = null;

    for (const edge of sortedEdges) {
      const cond = typeof edge.condition === 'string' ? { isDefault: edge.condition === 'else' || edge.condition === 'other' } : edge.condition;
      const isDefault = cond?.isDefault || false;

      if (isDefault) {
        defaultTargetNodeId = edge.targetNodeId;
        continue;
      }

      if (this.evaluateCondition(edge.condition, formData)) {
        matchedTargetNodeId = edge.targetNodeId;
        break;
      }
    }

    const targetId = matchedTargetNodeId || defaultTargetNodeId;
    if (!targetId) {
      throw new BusinessException('无法流转流程：分支条件未匹配，且未设置默认流转分支');
    }

    const targetNode = template.nodes.find(n => n.id === targetId);
    if (targetNode && targetNode.type === 'condition') {
      return this.getNextExecutableNodeId(targetNode.id, template, instanceId, transaction);
    }

    return targetId;
  }
}
