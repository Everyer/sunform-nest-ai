import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DictCreateDto, DictPageListDto, DictUpdateDto } from './dto/create-dict.dto';
import { Dict } from './entities/dict.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class DictService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectModel(Dict)
    private model: typeof Dict,
  ) {
  }

  // 服务初始化时加载字典
  async onModuleInit() {
    try {
      await this.loadAllDictToCache();
    } catch (error) {
      console.error('Failed to load dicts to cache:', error.message);
    }
  }
  // 加载所有字典到缓存
  private async loadAllDictToCache() {
    const allDicts = await this.model.findAll({ raw: true });
    // 存储所有字典数据
    await this.cacheManager.set('ALL_DICT_DATA', allDicts);

    // 按类型分组存储，方便快速查询
    const dictMap = new Map();
    allDicts.forEach(dict => {
      if (!dict.pid) {
        const children = allDicts.filter(item => item.pid === dict.id);
        dictMap.set(dict.value, children);
      }
    });

    // 存储分组数据
    await this.cacheManager.set('DICT_MAP', Object.fromEntries(dictMap));
  }
  // 获取字典项
  async getDictItems(code: string) {
    const dictMap = await this.cacheManager.get('DICT_MAP');
    return dictMap?.[code] || [];
  }
  // 获取字典标签
  async getDictLabel(value: string) {

    const allDicts = await this.cacheManager.get('ALL_DICT_DATA') as DictCreateDto[]
    const dict = allDicts.find(item => item.value === value);
    return dict?.label || '';
  }
  async create(CreateDto: DictCreateDto): Promise<Dict> {
    let hasCode = await this.model.findOne({
      where: {
        value: CreateDto.value
      }
    })
    if (hasCode) {
      throw new BusinessException('字典编码已存在')
    }
    await this.loadAllDictToCache();
    return this.model.create(CreateDto as any);
  }

  async findPageList(dto: DictPageListDto) {
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
    const buildTree = (items: Dict[], parentId: string = ""): any[] => {
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

  async update(dto: DictUpdateDto) {
    const { id } = dto;
    let res = this.model.update(dto, {
      where: {
        id
      }
    })
    await this.loadAllDictToCache();
    return res
  }
  async findListByCode(code: string) {
    if (!code) {
      throw new BusinessException('字典编码不能为空');
    }
    // 先找到对应的字典节点
    const dictNode = await this.model.findOne({
      where: { value: code },
      raw: true
    });

    if (!dictNode) {
      throw new BusinessException('字典编码不存在');
    }

    // 获取所有字典数据
    const allDicts = await this.model.findAll({
      order: [['sort', 'ASC']],
      raw: true
    });

    // 构建树形结构
    const buildTree = (items: Dict[], parentId: string): any[] => {
      return items
        .filter(item => item.pid === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    // 从找到的节点开始构建子树
    return buildTree(allDicts, dictNode.id);
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
      await this.loadAllDictToCache();
      return true
    } else {
      throw new BusinessException('删除失败');
    }
  }
}
