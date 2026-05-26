import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PrintTemplate } from '../entities/print-template.entity';
import { PrintTemplateCreateDto, PrintTemplatePageListDto, PrintTemplateUpdateDto } from '../dto/print-template.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { User } from '../../../system/user/entities/user.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { Op } from 'sequelize';

@Injectable()
export class PrintTemplateService {
  constructor(
    @InjectModel(PrintTemplate)
    private readonly model: typeof PrintTemplate,
  ) { }

  async create(dto: PrintTemplateCreateDto, userId: string): Promise<PrintTemplate> {
    const payload = {
      ...dto,
      createBy: userId,
      updateBy: userId,
    };
    return await this.model.create(payload as any);
  }

  async findPageList(dto: PrintTemplatePageListDto) {
    const { pageindex, pagesize, searchKey, appId } = dto;
    const where: any = {};

    if (searchKey) {
      where[Op.or] = [
        { templateName: { [Op.like]: `%${searchKey}%` } },
        { templateId: { [Op.like]: `%${searchKey}%` } }
      ];
    }
    
    if (appId) {
      where.appId = appId;
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

  async findOne(id: string): Promise<PrintTemplate> {
    if (!id) {
      throw new BusinessException('模板唯一标识 ID 不能为空');
    }
    const template = await this.model.findByPk(id);
    if (!template) {
      throw new BusinessException('所请求的打印模板不存在');
    }
    return template;
  }

  // 快捷通过唯一 templateId 字符串匹配模板以直接打印
  async findByTemplateId(templateId: string, appId?: string): Promise<PrintTemplate> {
    const where: any = { templateId };
    if (appId) {
      where.appId = appId;
    }
    const template = await this.model.findOne({ where });
    if (!template) {
      throw new BusinessException(`无法匹配到代码为「${templateId}」的打印模板`);
    }
    return template;
  }

  async update(dto: PrintTemplateUpdateDto, userId: string) {
    const { id } = dto;
    const template = await this.findOne(id);
    const payload = {
      ...dto,
      updateBy: userId,
    };
    return await this.model.update(payload, {
      where: { id }
    });
  }

  async remove(id: string) {
    const template = await this.findOne(id);
    const count = await this.model.destroy({
      where: { id }
    });
    if (count > 0) {
      return true;
    } else {
      throw new BusinessException('删除打印模板失败');
    }
  }
}
