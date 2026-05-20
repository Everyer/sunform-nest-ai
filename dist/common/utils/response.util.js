"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtil = void 0;
class ResponseUtil {
    static success(data, message = 'success') {
        return {
            data,
            code: 0,
            message,
            success: true,
        };
    }
    static error(message = 'error', code = 1) {
        return {
            data: null,
            code,
            message,
            success: false,
        };
    }
}
exports.ResponseUtil = ResponseUtil;
//# sourceMappingURL=response.util.js.map