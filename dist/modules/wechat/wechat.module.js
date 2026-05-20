"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatModule = void 0;
const common_1 = require("@nestjs/common");
const wechat_service_1 = require("./wechat.service");
const wechat_controller_1 = require("./wechat.controller");
let WechatModule = class WechatModule {
};
exports.WechatModule = WechatModule;
exports.WechatModule = WechatModule = __decorate([
    (0, common_1.Module)({
        controllers: [wechat_controller_1.WechatController],
        providers: [wechat_service_1.WechatService],
        exports: [wechat_service_1.WechatService],
    })
], WechatModule);
//# sourceMappingURL=wechat.module.js.map