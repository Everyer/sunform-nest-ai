import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from './user.entity';
import { Role } from '../../role/entities/role.entity';

@Table({ tableName: 'userroles' })
export class UserRole extends Model {
    @ForeignKey(() => User)
    @Column
    userId: string;

    @ForeignKey(() => Role)
    @Column
    roleId: string;
}