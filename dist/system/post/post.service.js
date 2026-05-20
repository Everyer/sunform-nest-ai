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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const post_entity_1 = require("./entities/post.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
let PostService = class PostService {
    constructor(model) {
        this.model = model;
    }
    async create(CreateDto) {
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
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id);
    }
    update(dto) {
        const { id } = dto;
        return this.model.update(dto, {
            where: {
                id
            }
        });
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
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(post_entity_1.Post)),
    __metadata("design:paramtypes", [Object])
], PostService);
//# sourceMappingURL=post.service.js.map