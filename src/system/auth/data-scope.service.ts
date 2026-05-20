import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../role/entities/role.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Op } from 'sequelize';

@Injectable()
export class DataScopeService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(Department)
    private deptModel: typeof Department,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  /**
   * 根据当前用户获取其数据权限范围内的部门ID列表
   * @returns deptIds — 空数组表示无限制（全部）
   */
  async getDeptIds(user: any): Promise<string[]> {
    if (!user?.roles?.length) return [];

    const roleIds = user.roles.map(r => r.id);
    const roles = await this.roleModel.findAll({
      where: { id: roleIds },
      include: ['departments'],
    });

    // 如果任一角色是"全部"，则无限制
    if (roles.some(r => r.dataScope === '4')) return [];

    const deptSet = new Set<string>();

    for (const role of roles) {
      switch (role.dataScope) {
        case '1': // 本部门及以下
          if (user.deptId) {
            deptSet.add(user.deptId);
            const subIds = await this.getSubDeptIds(user.deptId);
            subIds.forEach(id => deptSet.add(id));
          }
          break;
        case '2': // 本部门
          if (user.deptId) deptSet.add(user.deptId);
          break;
        case '3': // 自定义
          if (role.departments?.length) {
            role.departments.forEach(d => deptSet.add(d.id));
          }
          break;
        // '0'（本人）— 无部门过滤，由 createBy 控制
      }
    }

    return [...deptSet];
  }

  async getSubDeptIds(parentId: string): Promise<string[]> {
    const ids: string[] = [];
    const children = await this.deptModel.findAll({
      where: { pid: parentId },
      attributes: ['id'],
    });
    for (const child of children) {
      ids.push(child.id);
      const subIds = await this.getSubDeptIds(child.id);
      ids.push(...subIds);
    }
    return ids;
  }

  /** 构建 { deptId: { [Op.in]: ids } } 或 undefined */
  async buildDeptWhere(user: any): Promise<any> {
    const deptIds = await this.getDeptIds(user);
    if (!deptIds.length) return undefined; // 无限制
    return { deptId: { [Op.in]: deptIds } };
  }

  /**
   * 通过 createBy(userId) 构建数据权限过滤条件
   * 先算出可见部门 → 找到这些部门下的所有用户 → 过滤 createBy
   * 适用于业务表（继承 BaseHasUserModel 且有 createBy 字段）
   */
  async buildCreateByWhere(user: any): Promise<any> {
    const deptIds = await this.getDeptIds(user);
    if (!deptIds.length) return undefined; // 全部数据权限
    const users = await this.userModel.findAll({
      where: { deptId: { [Op.in]: deptIds } },
      attributes: ['id'],
    });
    const userIds = users.map(u => u.id);
    if (!userIds.length) return { createBy: null }; // 无数据
    return { createBy: { [Op.in]: userIds } };
  }
}
