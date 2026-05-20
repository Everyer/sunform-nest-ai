import { Injectable } from '@nestjs/common';
import { UserCreateDto, UserPageListDto, UserUpdateDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { StaffService } from '../staff/staff.service'
import { BusinessException } from '../../common/exceptions/business.exception';
import { Role } from "../role/entities/role.entity";
import { Staff } from '../staff/entities/staff.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private model: typeof User,
    private staffService: StaffService,
  ) { }
  async create(CreateDto: UserCreateDto): Promise<User> {
    const { roleIds, staffId } = CreateDto;
    const resStaff = await this.staffService.findOne(staffId);

    if (resStaff && resStaff.deptId) {
      const deptId = resStaff.deptId
      const user = await this.model.create({
        ...CreateDto,
        deptId
      } as any);
      if (roleIds?.length) {
        await user.$set('roles', roleIds);
      }
      return user;
    } else {
      throw new BusinessException('未找到该员工所对应的部门')
    }
  }

  async findPageList(dto: UserPageListDto) {
    const { pageindex, pagesize } = dto;
    const where: any = {};
    const { rows, count } = await this.model.findAndCountAll({
      where,
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['sort', 'ASC']],
      include: ['roles', 'department', {
        model: Staff,
        attributes: ['staffName']
      }]
    });
    return {
      list: rows,
      total: count
    };
  }
  findAll() {
    return this.model.findAll({
      include: ['roles', 'department', {
        model: Staff,
        attributes: ['staffName']
      }]
    });
  }

  async findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    let role = await this.model.findByPk(id, {
      include: {
        model: Role,
        attributes: ['id'],
        through: { attributes: [] }
      }
    });
    if (role) {
      let obj = role.toJSON();
      obj.roleIds = obj.roles.map((item: any) => item.id)
      delete obj.roles
      return obj
    } else {
      throw new BusinessException('未找到该用户')
    }
  }
  findOneByUserPass(username: string, password: string) {

    return this.model.findOne({
      where: {
        username,
        password
      },
      include: ['roles', 'department', {
        model: Staff,
        attributes: ['staffName']
      }]
    });


  }

  async update(dto: UserUpdateDto) {
    const { id, roleIds } = dto;
    console.log(dto);
    const res = await this.model.update(dto, {
      where: {
        id
      }
    });
    if (roleIds) {
      const user = await this.model.findByPk(id);
      if (user) {
        await user.$set('roles', roleIds);
      }
    }
    return res;
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
