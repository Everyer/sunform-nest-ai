"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictService = void 0;
const common_1 = require("@nestjs/common");
const dict_entity_1 = require("./entities/dict.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
const cache_manager_1 = require("@nestjs/cache-manager");
let DictService = class DictService {
    constructor(cacheManager, model) {
        this.cacheManager = cacheManager;
        this.model = model;
    }
    async onModuleInit() {
        try {
            await this.loadAllDictToCache();
        }
        catch (error) {
            console.error('Failed to load dicts to cache:', error.message);
        }
    }
    async loadAllDictToCache() {
        const allDicts = await this.model.findAll({ raw: true });
        await this.cacheManager.set('ALL_DICT_DATA', allDicts);
        const dictMap = new Map();
        allDicts.forEach(dict => {
            if (!dict.pid) {
                const children = allDicts.filter(item => item.pid === dict.id);
                dictMap.set(dict.value, children);
            }
        });
        await this.cacheManager.set('DICT_MAP', Object.fromEntries(dictMap));
    }
    async getDictItems(code) {
        const dictMap = await this.cacheManager.get('DICT_MAP');
        return dictMap?.[code] || [];
    }
    async getDictLabel(value) {
        const allDicts = await this.cacheManager.get('ALL_DICT_DATA');
        const dict = allDicts.find(item => item.value === value);
        return dict?.label || '';
    }
    async create(CreateDto) {
        let hasCode = await this.model.findOne({
            where: {
                value: CreateDto.value
            }
        });
        if (hasCode) {
            throw new business_exception_1.BusinessException('字典编码已存在');
        }
        await this.loadAllDictToCache();
        return this.model.create(CreateDto);
    }
    async findPageList(dto) {
        const { pageindex, pagesize } = dto;
        const { rows, count } = await this.model.findAndCountAll({
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['sort', 'ASC']]
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll();
    }
    async findTree() {
        const allMenus = await this.model.findAll({
            order: [['sort', 'ASC']],
            raw: true
        });
        const buildTree = (items, parentId = "") => {
            return items
                .filter(item => {
                if (!item.pid && !parentId) {
                    return true;
                }
                return item.pid === parentId;
            })
                .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
        };
        return buildTree(allMenus);
    }
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id);
    }
    async update(dto) {
        const { id } = dto;
        let res = this.model.update(dto, {
            where: {
                id
            }
        });
        await this.loadAllDictToCache();
        return res;
    }
    async findListByCode(code) {
        if (!code) {
            throw new business_exception_1.BusinessException('字典编码不能为空');
        }
        const dictNode = await this.model.findOne({
            where: { value: code },
            raw: true
        });
        if (!dictNode) {
            throw new business_exception_1.BusinessException('字典编码不存在');
        }
        const allDicts = await this.model.findAll({
            order: [['sort', 'ASC']],
            raw: true
        });
        const buildTree = (items, parentId) => {
            return items
                .filter(item => item.pid === parentId)
                .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
        };
        return buildTree(allDicts, dictNode.id);
    }
    async remove(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        let count = await this.model.destroy({
            where: {
                id
            }
        });
        if (count > 0) {
            await this.loadAllDictToCache();
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
};
exports.DictService = DictService;
exports.DictService = DictService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(1, (0, sequelize_1.InjectModel)(dict_entity_1.Dict)),
    __metadata("design:paramtypes", [Object, Object])
], DictService);
//# sourceMappingURL=dict.service.js.map