import { BaseModel } from '../../../common/base.entity';
import { KnowledgeDocument } from './knowledge-document.entity';
export declare class KnowledgeBase extends BaseModel {
    name: string;
    description: string;
    status: string;
    documents: KnowledgeDocument[];
}
