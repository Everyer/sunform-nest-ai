import { BaseModel } from '../../../common/base.entity';
import { KnowledgeDocument } from './knowledge-document.entity';
export declare class DocumentChunk extends BaseModel {
    documentId: string;
    document: KnowledgeDocument;
    content: string;
    embedding: number[];
}
