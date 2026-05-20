import { Injectable } from '@nestjs/common';
import { RoleCreateDto, RolePageListDto, RoleUpdateDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
import { Menu } from '../menu/entities/menu.entity';
import { Department } from '../department/entities/department.entity';
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private model: typeof Role,
  ) { }
  async create(CreateDto: RoleCreateDto): Promise<Role> {
    const { menuIds, departmentIds } = CreateDto;
    const role = await this.model.create(CreateDto as any);
    // 处理菜单关联
    if (menuIds?.length) {
      await role.$set('menus', menuIds);
    }

    // 处理部门关联
    if (departmentIds?.length) {
      await role.$set('departments', departmentIds);
    }
    return role;
  }

  async findPageList(dto: RolePageListDto) {
    const { pageindex, pagesize } = dto;
    console.log(dto);
    const { rows, count } = await this.model.findAndCountAll({
      offset: (pageindex - 1) * pagesize,
      limit: pagesize,
      order: [['sort', 'ASC']]
    });
    return {
      list: rows,
      total: count
    };
  }
  findAll() {
    return this.model.findAll({
      include: ['menus', 'departments']
    });
  }

  async findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    let res = await this.model.findByPk(id, {
      include: [
        {
          model: Menu,
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: Department,
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    if (res) {
      let obj = res.toJSON()
      obj.menuIds = obj.menus.map(e => e.id)
      obj.departmentIds = obj.departments.map(e => e.id)
      delete obj.menus
      delete obj.departments
      return obj;
    } else {
      throw new BusinessException('角色不存在');
    }
  }

  async update(dto: RoleUpdateDto) {
    const { id, menuIds, departmentIds } = dto;

    // 更新角色信息
    const [affectedCount] = await this.model.update(dto, {
      where: { id }
    });

    if (affectedCount === 0) {
      throw new Error('角色未找到或未更新');
    }

    // 重新获取角色实例
    const role = await this.model.findByPk(id);

    if (!role) {
      throw new Error('角色未找到');
    }

    // 处理菜单关联
    if (menuIds?.length) {
      await role.$set('menus', menuIds);
    }

    // 处理部门关联
    if (departmentIds?.length) {
      await role.$set('departments', departmentIds);
    }

    return role;
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
