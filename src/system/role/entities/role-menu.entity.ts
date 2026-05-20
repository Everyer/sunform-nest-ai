import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Role } from './role.entity';
import { Menu } from '../../menu/entities/menu.entity';

@Table({ tableName: 'rolemenus' })
export class RoleMenu extends Model {
    @ForeignKey(() => Role)
    @Column
    roleId: string;

    @ForeignKey(() => Menu)
    @Column
    menuId: string;
}