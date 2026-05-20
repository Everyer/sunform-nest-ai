import { PageCreateDto, PagePageListDto, PageUpdateDto } from '../dto/page.dto';
import { Page } from '../entities/page.entity';
export declare class PageService {
    private model;
    constructor(model: typeof Page);
    create(createDto: PageCreateDto): Promise<Page>;
    findPageList(dto: PagePageListDto): Promise<{
        list: Page[];
        total: number;
    }>;
    findAll(userid: string): Promise<Page[]>;
    findOne(id: string): Promise<Page | null>;
    update(dto: PageUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
    findByProjectId(projectId: string): Promise<Page[]>;
}
