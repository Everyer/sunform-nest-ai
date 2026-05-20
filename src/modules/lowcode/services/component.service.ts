import { Injectable } from '@nestjs/common';
import { ComponentCreateDto, ComponentPageListDto, ComponentUpdateDto, GetConfigByOtherProjectDto } from '../dto/component.dto';
import { Component } from '../entities/component.entity';
import { Project } from '../entities/project.entity';
import { Page } from '../entities/page.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { User } from '../../../system/user/entities/user.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { Op } from 'sequelize';

@Injectable()
export class ComponentService {
  constructor(
    @InjectModel(Component)
    private model: typeof Component,
  ) { }

  async create(createDto: ComponentCreateDto): Promise<Component> {
    // 检查组件代码是否已存在
    const existingComponent = await this.model.findOne({
      where: {
        componentCode: createDto.componentCode
      }
    });
    if (existingComponent) {
      throw new BusinessException('组件代码已存在');
    }
    return this.model.create(createDto as any);
  }

  async findPageList(dto: ComponentPageListDto) {
    const { pageindex, pagesize, componentName, componentCode, componentType, projectId, pageId, isEnable, createBy } = dto;
    const where: any = {};

    // 模糊查询条件
    if (componentName) {
      where.componentName = { [Op.like]: `%${componentName}%` };
    }
    if (componentCode) {
      where.componentCode = { [Op.like]: `%${componentCode}%` };
    }
    if (createBy) {
      where.createBy = createBy;
    }

    // 精确查询条件
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
        },
        {
          model: Page,
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
          model: Project,
          attributes: ['projectName']
        },
        {
          model: Page,
          attributes: ['pageName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id, {
      include: [
        {
          model: Project,
          attributes: ['projectName']
        },
        {
          model: Page,
          attributes: ['pageName']
        }
      ]
    });
  }

  async update(dto: ComponentUpdateDto, user: User) {
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
        // 检查是否是创建者或可操作人
        const isCreator = dto.createBy === alreadyCreatedUser.createBy;

        if (!isCreator) {
          throw new BusinessException('您没有权限修改该组件');
        }
      }
    }

    // 检查组件代码是否已被其他记录使用
    const existingComponent = await this.model.findOne({
      where: {
        componentCode,
        id: { [Op.ne]: id }
      }
    });

    if (existingComponent) {
      throw new BusinessException('组件代码已存在');
    }
    return this.model.update(dto, {
      where: {
        id
      }
    });
  }

  async remove(id: string, user: User) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }

    // 检查是否是管理员
    const isAdmin = user.roles?.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
    if (!isAdmin) {
      throw new BusinessException('只有管理员才能删除组件');
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
  async findComponentById(id: string) {
    let res = await this.model.findByPk(id, {
      include: [
        {
          model: Project,
          attributes: ['projectName']
        },
        {
          model: Page,
          attributes: ['pageName']
        }
      ]
    });
    if (res) {
      return res.componentConfig;
    } else {
      throw new BusinessException('组件不存在');
    }
  }
  async findComponentByComponentCode(componentCode: string) {
    let res = await this.model.findOne({
      where: {
        componentCode
      }
    });
    if (res) {
      return res.componentConfig;
    } else {
      throw new BusinessException('组件不存在');
    }
  }
  findByPageId(pageId: string) {
    return this.model.findAll({
      where: {
        pageId,
        isEnable: true,
      },
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['componentConfig']
      },
      //获取用户信息
      include: [{
        model: User,
        attributes: ['username'],
        include: [{
          model: Staff,
          attributes: ['staffName']
        }]
      }]
    });
  }

  findByProjectId(projectId: string) {
    return this.model.findAll({
      where: {
        projectId,
        isEnable: true
      },
      include: [{
        model: Page,
        attributes: ['pageName']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 根据项目ID和组件ID或组件代码获取组件配置（跳过token验证）
   * @param dto 查询参数
   * @returns 组件配置信息
   */
  async getConfigByOtherProject(dto: GetConfigByOtherProjectDto) {
    const { projectId, componentId, componentCode } = dto;

    // 验证参数
    if (!projectId) {
      throw new BusinessException('缺少项目秘钥');
    }

    if (!componentId && !componentCode) {
      throw new BusinessException('缺少组件秘钥');
    }

    // 构建查询条件
    const where: any = {
      projectId
    };

    if (componentId) {
      where.id = componentId;
    }

    if (componentCode) {
      where.componentCode = componentCode;
    }

    // 查询组件
    const component = await this.model.findOne({
      where,
      attributes: ['componentConfig', 'componentCode', 'componentName', 'id']
    });

    if (!component) {
      throw new BusinessException('获取失败');
    }

    return component;
  }

  /**
   * 更新组件的可操作人列表
   * @param id 组件ID
   * @param operatorIds 可操作人ID数组
   * @param user 当前用户
   * @returns 更新结果
   */
  async updateOperators(id: string, operatorIds: string[], user: User) {
    if (!id) {
      throw new BusinessException('组件ID不能为空');
    }

    // 检查组件是否存在
    const component = await this.model.findByPk(id, {
      attributes: ['id', 'createBy', 'operatorIds']
    });

    if (!component) {
      throw new BusinessException('组件不存在');
    }

    // 权限检查：只有管理员或创建者可以修改可操作人
    const isAdmin = user.roles.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
    const isCreator = component.createBy === user.id;

    if (!isAdmin && !isCreator) {
      throw new BusinessException('您没有权限修改该组件的可操作人');
    }
    if (!operatorIds || operatorIds.length === 0) {
      throw new BusinessException('可操作人不能为空');
    }

    // 更新可操作人列表
    await this.model.update(
      { createBy: operatorIds[0] },
      { where: { id } }
    );

    return true;
  }
} 