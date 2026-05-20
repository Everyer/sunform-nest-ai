"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinuationDetectorService = void 0;
const common_1 = require("@nestjs/common");
let ContinuationDetectorService = class ContinuationDetectorService {
    shouldContinue(context) {
        const { finishReason } = context;
        if (finishReason === 'length') {
            return {
                shouldContinue: true,
                confidence: 0.95,
                reason: 'AI响应因长度限制被截断，需要续写',
                continuationPrompt: '请继续上面的内容'
            };
        }
        if (finishReason === 'stop') {
            return {
                shouldContinue: false,
                confidence: 0.95,
                reason: 'AI响应自然结束，无需续写'
            };
        }
        return {
            shouldContinue: false,
            confidence: 0.8,
            reason: `未知的结束原因: ${finishReason}，默认不续写`
        };
    }
};
exports.ContinuationDetectorService = ContinuationDetectorService;
exports.ContinuationDetectorService = ContinuationDetectorService = __decorate([
    (0, common_1.Injectable)()
], ContinuationDetectorService);
//# sourceMappingURL=continuation-detector.service.js.map