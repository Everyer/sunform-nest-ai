import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
export declare class KnowledgeService {
    private baseModel;
    private docModel;
    private chunkModel;
    private readonly siliconflowApiKey;
    private readonly siliconflowBaseUrl;
    constructor(baseModel: typeof KnowledgeBase, docModel: typeof KnowledgeDocument, chunkModel: typeof DocumentChunk);
    getEmbedding(text: string): Promise<number[]>;
    private splitIntoChunks;
    createBase(name: string, description?: string): Promise<KnowledgeBase>;
    listBases(): Promise<KnowledgeBase[]>;
    updateBase(id: string, name: string, description?: string): Promise<KnowledgeBase>;
    deleteBase(id: string): Promise<void>;
    listDocuments(baseId: string): Promise<KnowledgeDocument[]>;
    uploadAndParseDocument(baseId: string, title: string, content: string, type: string, size: number): Promise<KnowledgeDocument>;
    private parseDocumentAsync;
    deleteDocument(id: string): Promise<void>;
    getDocumentChunks(documentId: string): Promise<DocumentChunk[]>;
    searchSimilarChunksInBase(baseId: string, queryText: string, limit?: number): Promise<any[]>;
}
