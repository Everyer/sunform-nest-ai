"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let ValidationExceptionFilter = class ValidationExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const zhErrorMessages = {
            'must be a string': '必须是字符串',
            'must be shorter than': '长度必须小于',
            'must be longer than': '长度必须大于',
            'must be exactly': '长度必须等于',
            'must match': '必须匹配指定格式',
            'must be a number': '必须是数字',
            'must be an integer number': '必须是整数',
            'must not be less than': '不能小于',
            'must not be greater than': '不能大于',
            'must be positive': '必须是正数',
            'must be negative': '必须是负数',
            'must be a Date': '必须是日期格式',
            'must be a date string': '必须是日期字符串',
            'minimal allowed date': '不能早于指定日期',
            'maximal allowed date': '不能晚于指定日期',
            'must be a boolean value': '必须是布尔值',
            'must be an array': '必须是数组',
            'must contain at least': '至少包含',
            'must contain not more than': '不能包含多于',
            'must contain exactly': '必须包含',
            'must be a non-empty array': '不能是空数组',
            'must be an object': '必须是对象',
            'must be an instance of': '必须是指定类的实例',
            'must be an email': '必须是有效的邮箱地址',
            'must be a valid phone number': '必须是有效的电话号码',
            'must be a valid URL': '必须是有效的URL地址',
            'must be a UUID': '必须是UUID格式',
            'must be an IP': '必须是IP地址',
            'must not be empty': '不能为空',
            'should not be empty': '不能为空',
            'must be empty': '必须为空',
            'must be equal to': '必须等于',
            'must not be equal to': '不能等于',
            'must be able to transform': '无法转换为指定类型',
            'invalid value': '无效的值',
            'property should not exist': '不应包含此字段',
            'is not allowed': '不允许的值',
        };
        let message = '';
        if (exceptionResponse.message) {
            if (Array.isArray(exceptionResponse.message)) {
                const firstError = exceptionResponse.message[0];
                const fieldMatch = firstError.match(/^([a-zA-Z]+)/);
                const fieldName = fieldMatch ? fieldMatch[1] : '';
                let translatedMessage = firstError;
                for (const [en, zh] of Object.entries(zhErrorMessages)) {
                    if (firstError.toLowerCase().includes(en.toLowerCase())) {
                        translatedMessage = `${fieldName}${zh}`;
                        break;
                    }
                }
                message = translatedMessage;
            }
            else {
                message = exceptionResponse.message;
            }
        }
        else {
            message = '请求参数错误';
        }
        response.status(200).json({
            success: false,
            code: status,
            message,
            data: null
        });
    }
};
exports.ValidationExceptionFilter = ValidationExceptionFilter;
exports.ValidationExceptionFilter = ValidationExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.BadRequestException)
], ValidationExceptionFilter);
//# sourceMappingURL=validation-exception.filter.js.map