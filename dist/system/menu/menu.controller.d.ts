import { MenuService } from './menu.service';
import { MenuCreateDto, MenuPageListDto, MenuUpdateDto } from './dto/create-menu.dto';
export declare class MenuController {
    private readonly service;
    constructor(service: MenuService);
    create(dto: MenuCreateDto): Promise<import("./entities/menu.entity").Menu>;
    update(dto: MenuUpdateDto): Promise<[affectedCount: number]>;
    list(dto: MenuPageListDto): Promise<{
        list: import("./entities/menu.entity").Menu[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/menu.entity").Menu | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/menu.entity").Menu[]>;
    findTree(): Promise<any[]>;
}
