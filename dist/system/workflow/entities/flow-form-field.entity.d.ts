import { BaseModel } from '../../../common/base.entity';
import { FlowFormDef } from './flow-form-def.entity';
export declare class FlowFormField extends BaseModel {
    formDefId: string;
    formDef: FlowFormDef;
    fieldKey: string;
    fieldLabel: string;
    fieldType: string;
    options: any;
    defaultValue: any;
    required: boolean;
    sortOrder: number;
}
