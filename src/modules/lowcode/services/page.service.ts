import { Injectable } from '@nestjs/common';
import { PageCreateDto, PagePageListDto, PageUpdateDto } from '../dto/page.dto';
import { Page } from '../entities/page.entity';
import { Project } from '../entities/project.entity';
import { Component } from '../entities/component.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { User } from '../../../system/user/entities/user.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { Op } from 'sequelize';

@Injectable()
export class PageService {
  constructor(
    @InjectModel(Page)
    private model: typeof Page,
  ) { }

  async create(createDto: PageCreateDto): Promise<Page> {
    return this.model.create(createDto as any);
  }

  async findPageList(dto: PagePageListDto) {
    const { pageindex, pagesize, pageName, projectId, isEnable, createBy } = dto;
    const where: any = {};

    // 模糊查询条件
    if (pageName) {
      where.pageName = { [Op.like]: `%${pageName}%` };
    }
    if (createBy) {
      where.createBy = createBy;
    }

    // 精确查询条件
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
          model: User,
          attributes: ['username'],
          include: [{
            model: Staff,
            attributes: ['staffName']
          }]
        },
        {
          model: Project,
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

  findAll(userid: string) {
    return this.model.findAll({
      include: [{
        model: Project,
        attributes: ['projectName']
      }],
      order: [['createdAt', 'DESC']],
      where: {
        createBy: userid
      }
    });
  }

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id, {
      include: [{
        model: Project,
        attributes: ['projectName']
      }]
    });
  }

  update(dto: PageUpdateDto) {
    const { id } = dto;
    return this.model.update(dto, {
      where: {
        id
      }
    });
  }

  async remove(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }

    // 检查该页面下是否有组件
    const componentCount = await Component.count({
      where: {
        pageId: id
      }
    });

    if (componentCount > 0) {
      throw new BusinessException(`该页面下有 ${componentCount} 个组件,无法删除`);
    }

    let count: number = await this.model.destroy({
      where: {
        id
      }
    });
    if (count > 0) {
      return true;
    } else {
      throw new BusinessException('删除失败');
    }
  }

  findByProjectId(projectId: string) {
    return this.model.findAll({
      where: {
        projectId,
        isEnable: true
      },
      order: [['createdAt', 'DESC']]
    });
  }
} 