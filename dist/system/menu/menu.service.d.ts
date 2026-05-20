import { MenuCreateDto, MenuPageListDto, MenuUpdateDto } from './dto/create-menu.dto';
import { Menu } from './entities/menu.entity';
export declare class MenuService {
    private model;
    constructor(model: typeof Menu);
    create(CreateDto: MenuCreateDto): Promise<Menu>;
    findPageList(dto: MenuPageListDto): Promise<{
        list: Menu[];
        total: number;
    }>;
    findAll(): Promise<Menu[]>;
    findTree(): Promise<any[]>;
    findOne(id: string): Promise<Menu | null>;
    update(dto: MenuUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
