"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setModuleRef = setModuleRef;
exports.IsUnique = IsUnique;
const class_validator_1 = require("class-validator");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
let moduleRef;
function setModuleRef(ref) {
    moduleRef = ref;
}
function IsUnique(model, field, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isUnique',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [model, field],
            options: validationOptions,
            validator: {
                async validate(value, args) {
                    if (!value)
                        return true;
                    try {
                        const modelToken = (0, sequelize_1.getModelToken)(model);
                        const modelInstance = moduleRef.get(modelToken);
                        const where = {
                            [field]: value
                        };
                        const object = args.object;
                        if (object.id) {
                            where.id = { [sequelize_2.Op.ne]: object.id };
                        }
                        const count = await modelInstance.count({ where });
                        console.log('Unique validation result:', { value, count, where });
                        return count === 0;
                    }
                    catch (error) {
                        console.error('IsUnique validation error:', error);
                        return true;
                    }
                },
                defaultMessage(args) {
                    return `${args.property} "${args.value}" 已存在`;
                }
            }
        });
    };
}
//# sourceMappingURL=is-unique.decorator.js.map