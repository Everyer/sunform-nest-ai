import { BaseModel } from '../../../common/base.entity';
import { KnowledgeBase } from './knowledge-base.entity';
import { DocumentChunk } from './document-chunk.entity';
export declare class KnowledgeDocument extends BaseModel {
    baseId: string;
    base: KnowledgeBase;
    title: string;
    type: string;
    size: number;
    status: string;
    charCount: number;
    chunkCount: number;
    chunks: DocumentChunk[];
}
