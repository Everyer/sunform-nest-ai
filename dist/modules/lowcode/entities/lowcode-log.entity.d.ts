import { Model } from 'sequelize-typescript';
export declare class LowcodeLog extends Model {
    id: string;
    componentCode: string;
    componentConfig: object;
    componentName: string;
    remark: string;
    createdAt: Date;
    updatedAt: Date;
}
