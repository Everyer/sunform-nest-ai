import { Injectable } from '@nestjs/common';
import { LowcodeLogCreateDto, LowcodeLogPageListDto, LowcodeLogUpdateRemarkDto } from '../dto/lowcode-log.dto';
import { LowcodeLog } from '../entities/lowcode-log.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { Op } from 'sequelize';
import { User } from '../../../system/user/entities/user.entity';

@Injectable()
export class LowcodeLogService {
  constructor(
    @InjectModel(LowcodeLog)
    private model: typeof LowcodeLog,
  ) { }

  async create(createDto: LowcodeLogCreateDto): Promise<LowcodeLog> {
    return this.model.create(createDto as any);
  }

  async findPageList(dto: LowcodeLogPageListDto) {
    const { pageindex, pagesize, componentCode, componentName } = dto;
    const where: any = {};

    // 模糊查询条件
    if (componentCode) {
      where.componentCode = { [Op.like]: `%${componentCode}%` };
    }
    if (componentName) {
      where.componentName = { [Op.like]: `%${componentName}%` };
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [
        ['createdAt', 'DESC']
      ]
    });

    return {
      list: rows,
      total: count
    };
  }

  /**
   * 分页查询指定code的日志
   */
  async findPageListByCode(componentCode: string, pageindex: number = 1, pagesize: number = 10) {
    if (!componentCode) {
      throw new BusinessException('componentCode不能为空');
    }
    const { rows, count } = await this.model.findAndCountAll({
      where: {
        componentCode: componentCode
      },
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [
        ['createdAt', 'DESC']
      ],
      attributes: {
        exclude: ['componentConfig']
      },

    });

    return {
      list: rows,
      total: count
    };
  }

  findAll() {
    return this.model.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 根据低代码code获取所有日志
   */
  findByCode(componentCode: string) {
    if (!componentCode) {
      throw new BusinessException('componentCode不能为空');
    }
    return this.model.findAll({
      where: {
        componentCode: componentCode
      },
      order: [['createdAt', 'DESC']]
    });
  }

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  /**
   * 更新日志备注
   */
  async updateRemark(dto: LowcodeLogUpdateRemarkDto) {
    const { id, remark } = dto;
    if (!id) {
      throw new BusinessException('id不能为空');
    }

    const log = await this.model.findByPk(id);
    if (!log) {
      throw new BusinessException('日志不存在');
    }

    await this.model.update(
      { remark },
      { where: { id } }
    );

    return true;
  }

  async remove(id: string, user: User) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }

    // 检查是否是管理员
    const isAdmin = user.roles?.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
    if (!isAdmin) {
      throw new BusinessException('只有管理员才能删除日志');
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