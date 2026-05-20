import { CreateDto, PageListDto, UpdateDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
export declare class PostService {
    private model;
    constructor(model: typeof Post);
    create(CreateDto: CreateDto): Promise<Post>;
    findPageList(dto: PageListDto): Promise<{
        list: Post[];
        total: number;
    }>;
    findAll(): Promise<Post[]>;
    findOne(id: string): Promise<Post | null>;
    update(dto: UpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
