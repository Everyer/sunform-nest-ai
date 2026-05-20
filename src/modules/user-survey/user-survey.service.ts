import { Injectable } from '@nestjs/common';
import { UserSurveyCreateDto, UserSurveyPageListDto, UserSurveyUpdateDto } from './dto/create-user-survey.dto';
import { UserSurvey } from './entities/user-survey.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
import { User } from '../../system/user/entities/user.entity'
import { Staff } from '../../system/staff/entities/staff.entity'
import { Op } from 'sequelize';
@Injectable()
export class UserSurveyService {
  constructor(
    @InjectModel(UserSurvey)
    private model: typeof UserSurvey,
  ) { }
  async create(CreateDto: UserSurveyCreateDto): Promise<UserSurvey> {
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: UserSurveyPageListDto, createByWhere?: any) {
    const { pageindex, pagesize, name, gender, age, mobile, address, postIntention } = dto;
    const where: any = {};
    if (createByWhere) Object.assign(where, createByWhere);
    // 模糊查询条件
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (mobile) {
      where.mobile = { [Op.like]: `%${mobile}%` };
    }
    if (postIntention) {
      where.postIntention = { [Op.like]: `%${postIntention}%` };
    }
    if (age) {
      where.age = { [Op.like]: `%${age}%` };
    }

    // 精确查询条件
    if (gender) {
      where.gender = gender;
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
  findAll() {
    return this.model.findAll();
  }
  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  update(dto: UserSurveyUpdateDto) {
    const { id } = dto;
    return this.model.update(dto, {
      where: {
        id
      }
    })
  }

  async remove(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    let count: number = await this.model.destroy({
      where: {
        id
      }
    })
    if (count > 0) {
      return true
    } else {
      throw new BusinessException('删除失败');
    }
  }
}
