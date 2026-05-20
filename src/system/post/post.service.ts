import { Injectable } from '@nestjs/common';
import { CreateDto, PageListDto, UpdateDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private model: typeof Post,
  ) { }
  async create(CreateDto: CreateDto): Promise<Post> {
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: PageListDto) {
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

  findOne(id: string) {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  update(dto: UpdateDto) {
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
