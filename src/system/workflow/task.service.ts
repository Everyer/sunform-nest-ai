import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowInstanceNode } from './entities/flow-instance-node.entity';
import { FlowTemplate } from './entities/flow-template.entity';
import { TaskPageListDto } from './dto/task.dto';
import { Op } from 'sequelize';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(FlowInstance) private instanceModel: typeof FlowInstance,
    @InjectModel(FlowInstanceNode) private nodeModel: typeof FlowInstanceNode,
  ) {}

  async findTodo(dto: TaskPageListDto, username: string) {
    const { pageindex, pagesize, title, templateId, priority } = dto;

    // 找到当前用户待处理节点
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
          model: FlowInstance,
          where: { status: 'running' },
          include: [{ model: FlowTemplate, attributes: ['name', 'category'] }],
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

  async findDone(dto: TaskPageListDto, username: string) {
    const { pageindex, pagesize, title } = dto;

    const doneNodes = await this.nodeModel.findAndCountAll({
      where: {
        assignee: username,
        status: { [Op.in]: ['approved', 'rejected', 'transferred'] },
      },
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['finishedAt', 'DESC']],
      include: [
        {
          model: FlowInstance,
          include: [{ model: FlowTemplate, attributes: ['name', 'category'] }],
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

  async detail(instanceId: string, nodeId: string) {
    const instance = await this.instanceModel.findByPk(instanceId, {
      include: [
        { model: FlowTemplate, attributes: ['id', 'name', 'code'] },
        { model: FlowInstanceNode, order: [['createdAt', 'ASC']] },
      ],
    });
    if (!instance) return null;

    const currentNode = instance.nodes.find(n => n.id === nodeId);
    return { instance, currentNode };
  }
}
