import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Role } from './role.entity';
import { Department } from '../../department/entities/department.entity';

@Table({ tableName: 'roledepartments' })
export class RoleDepartment extends Model {
    @ForeignKey(() => Role)
    @Column
    roleId: string;

    @ForeignKey(() => Department)
    @Column
    departmentId: string;
}