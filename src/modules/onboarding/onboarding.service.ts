import { Injectable } from '@nestjs/common';
import { OnboardingCreateDto, OnboardingUpdateDto, OnboardingPageListDto } from './dto/create-onboarding.dto';
import { Onboarding } from './entities/onboarding.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
import { User } from '../../system/user/entities/user.entity'
import { Staff } from '../../system/staff/entities/staff.entity'
import { DictService } from '../../system/dict/dict.service'
import { UserSurvey } from '../user-survey/entities/user-survey.entity';
@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Onboarding)
    private model: typeof Onboarding,
    private dictService: DictService
  ) { }
  async create(CreateDto: OnboardingCreateDto): Promise<Onboarding> {
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: OnboardingPageListDto, createByWhere?: any) {
    const { pageindex, pagesize } = dto;
    const where: any = {};
    if (createByWhere) Object.assign(where, createByWhere);
    let res = await this.model.findAndCountAll({
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
      }, {
        model: UserSurvey,
        attributes: ['name'],
      }, {
        model: Staff,
        attributes: ['staffName'],
        as: "hrStaff"
      }, {
        model: Staff,
        attributes: ['staffName'],
        as: "rentalStaff"
      }]
    });

    if (res) {
      const rows = await Promise.all(res.rows.map(async row => ({
        ...row.get({ plain: true }),
        rentalStatusName: await this.dictService.getDictLabel(row.rentalStatus)
      })));

      return {
        list: rows,
        total: res.count
      };
    } else {
      throw new BusinessException('查询失败');
    }
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

  update(dto: OnboardingUpdateDto) {
    const { id } = dto;
    return this.model.update(dto, {
      where: {
        id
      }
    })
  }

  async remove(id: string) {
    // let res=await this.dictService.getDictLabel("rentalStatus")
    // console.log(res);
    // return res;
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
