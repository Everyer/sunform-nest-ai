"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    constructor(message) {
        super({
            code: common_1.HttpStatus.BAD_REQUEST,
            message,
            success: false,
        }, common_1.HttpStatus.OK);
    }
}
exports.BusinessException = BusinessException;
//# sourceMappingURL=business.exception.js.map