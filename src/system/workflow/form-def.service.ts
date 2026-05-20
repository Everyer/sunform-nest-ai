import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowFormDef } from './entities/flow-form-def.entity';
import { FlowFormField } from './entities/flow-form-field.entity';
import { CreateFormDefDto, UpdateFormDefDto, FormDefPageListDto } from './dto/form-def.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class FormDefService {
  constructor(
    @InjectModel(FlowFormDef) private formDefModel: typeof FlowFormDef,
    @InjectModel(FlowFormField) private fieldModel: typeof FlowFormField,
  ) {}

  async create(dto: CreateFormDefDto) {
    const { fields, ...defData } = dto;
    const formDef = await this.formDefModel.create(defData as any);

    if (fields?.length) {
      await this.fieldModel.bulkCreate(fields.map((f: any) => ({ ...f, formDefId: formDef.id })));
    }
    return formDef;
  }

  async update(dto: UpdateFormDefDto) {
    const { id, fields, ...rest } = dto;
    const formDef = await this.formDefModel.findByPk(id);
    if (!formDef) throw new BusinessException('表单定义不存在');

    await formDef.update(rest as any);

    if (fields !== undefined) {
      await this.fieldModel.destroy({ where: { formDefId: id } });
      if (fields.length) {
        await this.fieldModel.bulkCreate(fields.map((f: any) => ({ ...f, formDefId: id })));
      }
    }
    return formDef;
  }

  async findPageList(dto: FormDefPageListDto) {
    const { pageindex, pagesize, name, code } = dto;
    const where: any = {};
    if (name) where.name = name;
    if (code) where.code = code;

    const { rows, count } = await this.formDefModel.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['createdAt', 'DESC']],
    });
    return { list: rows, total: count };
  }

  async findAll() {
    return this.formDefModel.findAll({ order: [['createdAt', 'DESC']] });
  }

  async findOne(id: string) {
    const formDef = await this.formDefModel.findByPk(id, {
      include: [{ model: FlowFormField, order: [['sortOrder', 'ASC']] }],
    });
    if (!formDef) throw new BusinessException('表单定义不存在');
    return formDef;
  }

  async remove(id: string) {
    const formDef = await this.formDefModel.findByPk(id);
    if (!formDef) throw new BusinessException('表单定义不存在');
    await this.fieldModel.destroy({ where: { formDefId: id } });
    await formDef.destroy();
    return true;
  }
}
