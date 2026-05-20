import { Injectable } from '@nestjs/common';
import { StaffCreateDto, StaffPageListDto, StaffUpdateDto } from './dto/create-staff.dto';
import { Staff } from './entities/staff.entity';
import { User } from '../user/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff)
    private model: typeof Staff,
  ) { }
  async create(dto: StaffCreateDto): Promise<Staff> {
    let hasCode = await this.model.findOne({
      where: {
        staffCode: dto.staffCode
      }
    })
    if (hasCode) {
      throw new BusinessException('员工编码已存在')
    }
    return this.model.create(dto as any);
  }

  async findPageList(dto: StaffPageListDto) {
    const { pageindex, pagesize } = dto;
    const where: any = {};
    const { rows, count } = await this.model.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['sort', 'ASC']],
      include: ['department', 'post']
    });
    return {
      list: rows,
      total: count
    };
  }
  findAll() {
    return this.model.findAll();
  }

  async findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return await this.model.findByPk(id) as StaffUpdateDto
  }

  update(dto: StaffUpdateDto) {
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
    const userCount = await User.count({
      where: {
        staffId: id
      }
    })
    if (userCount > 0) {
      throw new BusinessException('该员工下有用户，无法删除')
    }
    return this.model.destroy({
      where: {
        id
      }
    })
  }
}
