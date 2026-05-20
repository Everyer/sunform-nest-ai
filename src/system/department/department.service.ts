import { Injectable } from '@nestjs/common';
import { DepartmentCreateDto, DepartmentPageListDto, DepartmentUpdateDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department)
    private model: typeof Department,
  ) { }
  create(CreateDto: DepartmentCreateDto): Promise<Department> {
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: DepartmentPageListDto) {
    const { pageindex, pagesize } = dto;
    const where: any = {};
    const { rows, count } = await this.model.findAndCountAll({
      where,
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
    return this.model.findAll();
  }
  async findTree() {
    const treeData = await this.model.findAll({
      order: [['sort', 'ASC']],
      raw: true
    });

    const buildTree = (items: Department[], parentId: string | null = ""): any[] => {
      return items
        .filter(item => {
          if (!item.pid && !parentId) {
            return true
          }
          return item.pid === parentId
        })
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }))
    };
    return buildTree(treeData);
  }

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  update(dto: DepartmentUpdateDto) {
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
