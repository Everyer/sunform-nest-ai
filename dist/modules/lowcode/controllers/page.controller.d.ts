import { PageService } from '../services/page.service';
import { PageCreateDto, PagePageListDto, PageUpdateDto } from '../dto/page.dto';
export declare class PageController {
    private readonly service;
    constructor(service: PageService);
    create(dto: PageCreateDto): Promise<import("../entities").Page>;
    update(dto: PageUpdateDto): Promise<[affectedCount: number]>;
    list(dto: PagePageListDto): Promise<{
        list: import("../entities").Page[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("../entities").Page | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(request: any): Promise<import("../entities").Page[]>;
    findByProjectId(dto: {
        projectId: string;
    }): Promise<import("../entities").Page[]>;
}
