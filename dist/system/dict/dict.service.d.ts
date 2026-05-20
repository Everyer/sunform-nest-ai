import { OnModuleInit } from '@nestjs/common';
import { DictCreateDto, DictPageListDto, DictUpdateDto } from './dto/create-dict.dto';
import { Dict } from './entities/dict.entity';
import { Cache } from 'cache-manager';
export declare class DictService implements OnModuleInit {
    private cacheManager;
    private model;
    constructor(cacheManager: Cache, model: typeof Dict);
    onModuleInit(): Promise<void>;
    private loadAllDictToCache;
    getDictItems(code: string): Promise<any>;
    getDictLabel(value: string): Promise<string>;
    create(CreateDto: DictCreateDto): Promise<Dict>;
    findPageList(dto: DictPageListDto): Promise<{
        list: Dict[];
        total: number;
    }>;
    findAll(): Promise<Dict[]>;
    findTree(): Promise<any[]>;
    findOne(id: string): Promise<Dict | null>;
    update(dto: DictUpdateDto): Promise<[affectedCount: number]>;
    findListByCode(code: string): Promise<any[]>;
    remove(id: string): Promise<boolean>;
}
