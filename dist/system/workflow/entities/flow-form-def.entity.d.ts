import { BaseModel } from '../../../common/base.entity';
import { FlowFormField } from './flow-form-field.entity';
export declare class FlowFormDef extends BaseModel {
    name: string;
    code: string;
    sunformPageId: string;
    description: string;
    config: any;
    fields: FlowFormField[];
}
