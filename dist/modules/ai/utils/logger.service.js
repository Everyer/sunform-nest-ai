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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiLoggerService = void 0;
const common_1 = require("@nestjs/common");
let AiLoggerService = class AiLoggerService {
    constructor() {
        this.level = 'info';
        this.enableRequestLogging = true;
        this.level = process.env.LOG_LEVEL || 'info';
        this.enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING !== 'false';
    }
    setConfig(config) {
        if (config.level) {
            this.level = config.level;
        }
        if (config.enableRequestLogging !== undefined) {
            this.enableRequestLogging = config.enableRequestLogging;
        }
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [AI-${level.toUpperCase()}] ${message}`;
        if (data) {
            return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
        }
        return formattedMessage;
    }
    shouldLog(level) {
        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevelIndex = levels.indexOf(this.level);
        const messageIndex = levels.indexOf(level);
        return messageIndex <= currentLevelIndex;
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, data));
        }
    }
    error(message, data) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, data));
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, data));
        }
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
    logRequest(requestData) {
        if (!this.enableRequestLogging)
            return;
        this.info('HTTP Request', requestData);
    }
    logChatRequest(data) {
        this.info('AI Chat Request', data);
    }
    logTokenUsage(data) {
        this.debug('Token Usage', data);
    }
    logCompressionStats(data) {
        this.debug('Compression Stats', data);
    }
    logManagementDecision(data) {
        this.debug('Management Decision', data);
    }
};
exports.AiLoggerService = AiLoggerService;
exports.AiLoggerService = AiLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiLoggerService);
//# sourceMappingURL=logger.service.js.map