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
exports.FormDefService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const flow_form_def_entity_1 = require("./entities/flow-form-def.entity");
const flow_form_field_entity_1 = require("./entities/flow-form-field.entity");
const business_exception_1 = require("../../common/exceptions/business.exception");
let FormDefService = class FormDefService {
    constructor(formDefModel, fieldModel) {
        this.formDefModel = formDefModel;
        this.fieldModel = fieldModel;
    }
    async create(dto) {
        const { fields, ...defData } = dto;
        const formDef = await this.formDefModel.create(defData);
        if (fields?.length) {
            await this.fieldModel.bulkCreate(fields.map((f) => ({ ...f, formDefId: formDef.id })));
        }
        return formDef;
    }
    async update(dto) {
        const { id, fields, ...rest } = dto;
        const formDef = await this.formDefModel.findByPk(id);
        if (!formDef)
            throw new business_exception_1.BusinessException('表单定义不存在');
        await formDef.update(rest);
        if (fields !== undefined) {
            await this.fieldModel.destroy({ where: { formDefId: id } });
            if (fields.length) {
                await this.fieldModel.bulkCreate(fields.map((f) => ({ ...f, formDefId: id })));
            }
        }
        return formDef;
    }
    async findPageList(dto) {
        const { pageindex, pagesize, name, code } = dto;
        const where = {};
        if (name)
            where.name = name;
        if (code)
            where.code = code;
        const { rows, count } = await this.formDefModel.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['createdAt', 'DESC']],
        });
        return { list: rows, total: count };
    }
    async findAll() {
        return this.formDefModel.findAll({ order: [['createdAt', 'DESC']] });
    }
    async findOne(id) {
        const formDef = await this.formDefModel.findByPk(id, {
            include: [{ model: flow_form_field_entity_1.FlowFormField, order: [['sortOrder', 'ASC']] }],
        });
        if (!formDef)
            throw new business_exception_1.BusinessException('表单定义不存在');
        return formDef;
    }
    async remove(id) {
        const formDef = await this.formDefModel.findByPk(id);
        if (!formDef)
            throw new business_exception_1.BusinessException('表单定义不存在');
        await this.fieldModel.destroy({ where: { formDefId: id } });
        await formDef.destroy();
        return true;
    }
};
exports.FormDefService = FormDefService;
exports.FormDefService = FormDefService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(flow_form_def_entity_1.FlowFormDef)),
    __param(1, (0, sequelize_1.InjectModel)(flow_form_field_entity_1.FlowFormField)),
    __metadata("design:paramtypes", [Object, Object])
], FormDefService);
//# sourceMappingURL=form-def.service.js.map