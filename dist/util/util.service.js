"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const business_exception_1 = require("../common/exceptions/business.exception");
let UtilService = class UtilService {
    async getLowcodeCode(componentCode) {
        try {
            const response = await axios_1.default.post("http://sunform.tech/lowcode/components/getConfigByOtherProject", {
                componentCode,
                projectId: "b6bb5682-f794-44c1-b59d-bb1ed34792a0"
            });
            if (response.data.success) {
                return response.data.data;
            }
            else {
                throw new business_exception_1.BusinessException(response.data.message);
            }
        }
        catch (error) {
            throw new business_exception_1.BusinessException('获取组件配置失败');
        }
    }
    async getExampleLowcodeCode(componentCode) {
        try {
            const response = await axios_1.default.post("http://sunform.tech/lowcode/components/getConfigByOtherProject", {
                componentCode,
                projectId: "39043ba1-8c0a-4895-9531-4284c81b188c"
            });
            if (response.data.success) {
                return response.data.data;
            }
            else {
                throw new business_exception_1.BusinessException(response.data.message);
            }
        }
        catch (error) {
            throw new business_exception_1.BusinessException('获取组件配置失败');
        }
    }
};
exports.UtilService = UtilService;
exports.UtilService = UtilService = __decorate([
    (0, common_1.Injectable)()
], UtilService);
//# sourceMappingURL=util.service.js.map