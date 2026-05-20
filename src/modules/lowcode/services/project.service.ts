import { Injectable } from '@nestjs/common';
import { ProjectCreateDto, ProjectPageListDto, ProjectUpdateDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
import { Page } from '../entities/page.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { User } from '../../../system/user/entities/user.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { Op } from 'sequelize';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project)
    private model: typeof Project,
  ) { }

  async create(createDto: ProjectCreateDto): Promise<Project> {
    return this.model.create(createDto as any);
  }

  async findPageList(dto: ProjectPageListDto) {
    const { pageindex, pagesize, projectName, isEnable, createBy } = dto;
    const where: any = {};

    // 模糊查询条件
    if (projectName) {
      where.projectName = { [Op.like]: `%${projectName}%` };
    }
    if (createBy) {
      where.createBy = createBy;
    }

    // 精确查询条件
    if (isEnable !== undefined) {
      where.isEnable = isEnable;
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      include: [{
        model: User,
        attributes: ['username'],
        include: [{
          model: Staff,
          attributes: ['staffName']
        }]
      }],
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
      order: [['createdAt', 'DESC']],
      // where: {  
      // createBy: userid
      // }
    });
  }

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  update(dto: ProjectUpdateDto) {
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

    // 检查该项目下是否有页面
    const pageCount = await Page.count({
      where: {
        projectId: id
      }
    });

    if (pageCount > 0) {
      throw new BusinessException(`该项目下有 ${pageCount} 个页面,无法删除`);
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
} 