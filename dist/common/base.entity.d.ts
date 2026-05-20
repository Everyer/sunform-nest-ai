import { Model } from 'sequelize-typescript';
export declare class BaseModel extends Model {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
