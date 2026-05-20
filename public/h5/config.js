// H5 应用配置文件
window.AppConfig = {
    // API 基础配置
    api: {
        // 默认使用相对路径，自动指向当前服务器
        baseUrl: '', // 留空表示使用当前域名
        prefix: '/adminApi', // API 前缀
        timeout: 5000, // 请求超时时间（毫秒）
    },
    
    // 应用配置
    app: {
        name: 'H5 应用',
        version: '1.0.0',
        debug: true, // 是否开启调试模式
    },
    
    // 常用 API 端点
    endpoints: {
        // 系统模块
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            profile: '/auth/profile'
        },
        user: {
            list: '/user',
            create: '/user',
            update: '/user',
            delete: '/user'
        },
        menu: {
            list: '/menu',
            tree: '/menu/tree'
        },
        util: {
            test: '/util/test',
            upload: '/util/upload'
        },
        // 业务模块
        lowcode: {
            projects: '/lowcodeApi/project',
            pages: '/lowcodeApi/page',
            components: '/lowcodeApi/component'
        },
        wechat: {
            list: '/wechat',
            config: '/wechat/config'
        }
    }
};

// 工具函数：构建完整的 API URL
window.buildApiUrl = function(endpoint) {
    const config = window.AppConfig.api;
    const baseUrl = config.baseUrl || window.location.origin;
    return `${baseUrl}${config.prefix}${endpoint}`;
};

// 工具函数：通用 API 请求
window.apiRequest = async function(endpoint, options = {}) {
    const config = window.AppConfig.api;
    const url = window.buildApiUrl(endpoint);
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: config.timeout
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    if (window.AppConfig.app.debug) {
        console.log(`[API Request] ${finalOptions.method} ${url}`, finalOptions);
    }
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (window.AppConfig.app.debug) {
            console.log(`[API Response] ${response.status}`, data);
        }
        
        return {
            success: response.ok,
            status: response.status,
            data: data,
            response: response
        };
    } catch (error) {
        if (window.AppConfig.app.debug) {
            console.error(`[API Error]`, error);
        }
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

// 输出配置信息到控制台（仅在调试模式下）
if (window.AppConfig.app.debug) {
    console.log('[App Config]', window.AppConfig);
    console.log('[API Base URL]', window.buildApiUrl(''));
} 