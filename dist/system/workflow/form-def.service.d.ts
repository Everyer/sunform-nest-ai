import { FlowFormDef } from './entities/flow-form-def.entity';
import { FlowFormField } from './entities/flow-form-field.entity';
import { CreateFormDefDto, UpdateFormDefDto, FormDefPageListDto } from './dto/form-def.dto';
export declare class FormDefService {
    private formDefModel;
    private fieldModel;
    constructor(formDefModel: typeof FlowFormDef, fieldModel: typeof FlowFormField);
    create(dto: CreateFormDefDto): Promise<FlowFormDef>;
    update(dto: UpdateFormDefDto): Promise<FlowFormDef>;
    findPageList(dto: FormDefPageListDto): Promise<{
        list: FlowFormDef[];
        total: number;
    }>;
    findAll(): Promise<FlowFormDef[]>;
    findOne(id: string): Promise<FlowFormDef>;
    remove(id: string): Promise<boolean>;
}
