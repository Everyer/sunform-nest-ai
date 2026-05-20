import { Model } from 'sequelize-typescript';
import { User } from "../system/user/entities/user.entity";
export declare class BaseHasUserModel extends Model {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createBy: string;
    creator: User;
}
