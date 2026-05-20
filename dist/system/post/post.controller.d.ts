import { PostService } from './post.service';
import { CreateDto, PageListDto, UpdateDto } from './dto/create-post.dto';
export declare class PostController {
    private readonly service;
    constructor(service: PostService);
    create(dto: CreateDto): Promise<import("./entities/post.entity").Post>;
    update(dto: UpdateDto): Promise<[affectedCount: number]>;
    list(dto: PageListDto): Promise<{
        list: import("./entities/post.entity").Post[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/post.entity").Post | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/post.entity").Post[]>;
}
