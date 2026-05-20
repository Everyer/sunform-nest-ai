import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { getModelToken } from '@nestjs/sequelize';
import { ModuleRef } from '@nestjs/core';
import { Op } from 'sequelize';

let moduleRef: ModuleRef;

export function setModuleRef(ref: ModuleRef) {
    moduleRef = ref;
}

export function IsUnique(model: any, field: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isUnique',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [model, field],
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    if (!value) return true;

                    try {
                        const modelToken = getModelToken(model);
                        const modelInstance = moduleRef.get(modelToken);

                        const where: any = {
                            [field]: value
                        };

                        const object = args.object as any;
                        if (object.id) {
                            where.id = { [Op.ne]: object.id };
                        }

                        const count = await modelInstance.count({ where });
                        console.log('Unique validation result:', { value, count, where });
                        
                        // 只有当确实找到重复记录时才返回 false
                        return count === 0;
                    } catch (error) {
                        console.error('IsUnique validation error:', error);
                        // 发生错误时允许通过，避免误报
                        return true;
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} "${args.value}" 已存在`;
                }
            }
        });
    };
}