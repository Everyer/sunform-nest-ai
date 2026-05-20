import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly service;
    constructor(service: KnowledgeService);
    createBase(dto: {
        name: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/knowledge-base.entity").KnowledgeBase;
    }>;
    listBases(): Promise<{
        success: boolean;
        data: import("./entities/knowledge-base.entity").KnowledgeBase[];
    }>;
    updateBase(dto: {
        id: string;
        name: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/knowledge-base.entity").KnowledgeBase;
    }>;
    deleteBase(dto: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    listDocuments(baseId: string): Promise<{
        success: boolean;
        data: import("./entities/knowledge-document.entity").KnowledgeDocument[];
    }>;
    uploadDocument(dto: {
        baseId: string;
        title: string;
        content: string;
        type: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/knowledge-document.entity").KnowledgeDocument;
    }>;
    deleteDocument(dto: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getDocumentChunks(documentId: string): Promise<{
        success: boolean;
        data: import("./entities/document-chunk.entity").DocumentChunk[];
    }>;
    searchSimilarChunks(dto: {
        baseId: string;
        queryText: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: any[];
    }>;
}
