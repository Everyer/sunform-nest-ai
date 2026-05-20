import { ValidationOptions } from 'class-validator';
import { ModuleRef } from '@nestjs/core';
export declare function setModuleRef(ref: ModuleRef): void;
export declare function IsUnique(model: any, field: string, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
