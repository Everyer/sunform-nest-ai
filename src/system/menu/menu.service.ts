import { Injectable } from '@nestjs/common';
import { MenuCreateDto, MenuPageListDto, MenuUpdateDto } from './dto/create-menu.dto';
import { Menu } from './entities/menu.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu)
    private model: typeof Menu,
  ) { }
  create(CreateDto: MenuCreateDto): Promise<Menu> {
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: MenuPageListDto) {
    const { pageindex, pagesize } = dto;
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
    return this.model.findAll();
  }
  async findTree() {
    const allMenus = await this.model.findAll({
      order: [['sort', 'ASC']],
      raw: true
    });
    const buildTree = (items: Menu[], parentId: string = ""): any[] => {
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
    return buildTree(allMenus);
  }
  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  update(dto: MenuUpdateDto) {
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
