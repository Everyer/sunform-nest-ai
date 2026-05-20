import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowTemplate } from './entities/flow-template.entity';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowTemplateEdge } from './entities/flow-template-edge.entity';
import { FlowNodePermission } from './entities/flow-node-permission.entity';
import { CreateTemplateDto, UpdateTemplateDto, TemplatePageListDto } from './dto/template.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(FlowTemplate) private templateModel: typeof FlowTemplate,
    @InjectModel(FlowTemplateNode) private nodeModel: typeof FlowTemplateNode,
    @InjectModel(FlowTemplateEdge) private edgeModel: typeof FlowTemplateEdge,
    @InjectModel(FlowNodePermission) private permissionModel: typeof FlowNodePermission,
  ) {}

  async create(dto: CreateTemplateDto) {
    const { nodes, edges, nodePermissions, ...templateData } = dto;
    const template = await this.templateModel.create(templateData as any);
    if (nodes?.length) {
      await this.nodeModel.bulkCreate(nodes.map((n: any) => ({ ...n, templateId: template.id })));
    }
    if (edges?.length) {
      await this.edgeModel.bulkCreate(edges.map((e: any) => ({ ...e, templateId: template.id })));
    }
    if (nodePermissions?.length) {
      await this.permissionModel.bulkCreate(nodePermissions.map((p: any) => ({ ...p, templateId: template.id })));
    }
    return template;
  }

  async update(dto: UpdateTemplateDto) {
    const { id, nodes, edges, nodePermissions, ...rest } = dto;
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new BusinessException('模板不存在');

    // Use transaction to ensure atomicity
    const transaction = await this.templateModel.sequelize!.transaction();

    try {
      await template.update(rest as any, { transaction });

      // 1. Update Nodes
      if (nodes !== undefined) {
        const existingNodes = await this.nodeModel.findAll({ where: { templateId: id }, transaction });
        const existingNodeIds = existingNodes.map(n => n.id);
        const incomingNodeIds = nodes.map(n => n.id).filter(Boolean);

        // Delete nodes that are not in the incoming list
        const nodeIdsToDelete = existingNodeIds.filter(nid => !incomingNodeIds.includes(nid));
        if (nodeIdsToDelete.length > 0) {
          try {
            await this.nodeModel.destroy({ where: { id: nodeIdsToDelete, templateId: id }, transaction });
          } catch (err) {
            throw new BusinessException('无法删除已在流程实例中使用的节点，请先删除相关流程实例');
          }
        }

        // Upsert incoming nodes
        for (const n of nodes) {
          if (n.id && existingNodeIds.includes(n.id)) {
            await this.nodeModel.update({ ...n, templateId: id }, { where: { id: n.id }, transaction });
          } else {
            await this.nodeModel.create({ ...n, templateId: id }, { transaction });
          }
        }
      }

      // 2. Update Edges
      if (edges !== undefined) {
        // Destroy and recreate edges (usually safe as they aren't often referenced directly by instances)
        await this.edgeModel.destroy({ where: { templateId: id }, transaction });
        if (edges.length) {
          await this.edgeModel.bulkCreate(edges.map(e => ({ ...e, templateId: id })), { transaction });
        }
      }

      // 3. Update Permissions
      if (nodePermissions !== undefined) {
        await this.permissionModel.destroy({ where: { templateId: id }, transaction });
        if (nodePermissions.length) {
          await this.permissionModel.bulkCreate(nodePermissions.map(p => ({ ...p, templateId: id })), { transaction });
        }
      }

      await transaction.commit();
      return template;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findPageList(dto: TemplatePageListDto) {
    const { pageindex, pagesize, name, category, status } = dto;
    const where: any = {};
    if (name) where.name = name;
    if (category) where.category = category;
    if (status !== undefined) where.status = status;

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

  async findOne(id: string) {
    const template = await this.templateModel.findByPk(id, {
      include: [
        { model: FlowTemplateNode, order: [['order', 'ASC']] },
        { model: FlowTemplateEdge },
        { model: FlowNodePermission },
      ],
    });
    if (!template) throw new BusinessException('模板不存在');
    return template;
  }

  async publish(id: string) {
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new BusinessException('模板不存在');
    if (template.status !== 0 && template.status !== 2) throw new BusinessException('仅草稿或已停用状态可发布');
    await template.update({ status: 1, version: template.version + 1 });
    return template;
  }

  async deactivate(id: string) {
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new BusinessException('模板不存在');
    await template.update({ status: 2 });
    return template;
  }

  async remove(id: string) {
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new BusinessException('模板不存在');
    await this.edgeModel.destroy({ where: { templateId: id } });
    await this.permissionModel.destroy({ where: { templateId: id } });
    await this.nodeModel.destroy({ where: { templateId: id } });
    await template.destroy();
    return true;
  }
}
