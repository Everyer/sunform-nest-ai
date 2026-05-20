import { Injectable } from '@nestjs/common';
import { ConfigCreateDto, ConfigUpdateDto } from '../dto/config.dto';
import { LowcodeConfig } from '../entities/config.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BusinessException } from '../../../common/exceptions/business.exception';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(LowcodeConfig)
    private model: typeof LowcodeConfig,
  ) { }

  /**
   * 创建或更新配置
   * 如果没有userid的就新增，有userid的就更新该userid的其他表单值
   */
  async createOrUpdate(createDto: ConfigCreateDto, userid: string): Promise<LowcodeConfig> {
    // 查找是否存在该用户的配置
    const existingConfig = await this.model.findOne({
      where: { userid }
    });

    if (existingConfig) {
      // 存在则更新
      await this.model.update(
        { ...createDto },
        { where: { userid } }
      );
      return this.model.findOne({ where: { userid } }) as Promise<LowcodeConfig>;
    } else {
      // 不存在则新增
      return this.model.create({
        ...createDto,
        userid
      } as any);
    }
  }

  /**
   * 根据用户ID获取配置
   */
  async findByUserId(userid: string): Promise<LowcodeConfig | null> {
    return this.model.findOne({
      where: { userid },
      raw: true
    });
  }

  /**
   * 获取所有配置
   */
  async findAll(): Promise<LowcodeConfig[]> {
    return this.model.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 根据ID获取配置
   */
  async findOne(id: string): Promise<LowcodeConfig | null> {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    return this.model.findByPk(id);
  }

  /**
   * 更新配置
   */
  async update(dto: ConfigUpdateDto, userid: string) {
    const { id } = dto;
    
    if (id) {
      // 如果有ID，按ID更新
      return this.model.update(dto, {
        where: { id }
      });
    } else {
      // 如果没有ID，按userid更新
      return this.model.update(dto, {
        where: { userid }
      });
    }
  }

  /**
   * 删除配置
   */
  async remove(id: string): Promise<boolean> {
    if (!id) {
      throw new BusinessException('id不能为空');
    }
    const count: number = await this.model.destroy({
      where: { id }
    });
    if (count > 0) {
      return true;
    } else {
      throw new BusinessException('删除失败');
    }
  }

  /**
   * 根据用户ID删除配置
   */
  async removeByUserId(userid: string): Promise<boolean> {
    if (!userid) {
      throw new BusinessException('用户ID不能为空');
    }
    const count: number = await this.model.destroy({
      where: { userid }
    });
    if (count > 0) {
      return true;
    } else {
      throw new BusinessException('删除失败');
    }
  }
} 