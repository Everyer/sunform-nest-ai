"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const common_1 = require("@nestjs/common");
const validation_exception_filter_1 = require("./common/filters/validation-exception.filter");
const any_exception_filter_1 = require("./common/filters/any-exception.filter");
const swagger_1 = require("@nestjs/swagger");
const nestjs_knife4j2_1 = require("nestjs-knife4j2");
const userid_interceptor_1 = require("./common/interceptors/userid.interceptor");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.setGlobalPrefix('adminApi', {
        exclude: ['/static/*path']
    });
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalInterceptors(new userid_interceptor_1.UserIdInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        errorHttpStatusCode: 400,
    }));
    app.useGlobalFilters(new validation_exception_filter_1.ValidationExceptionFilter());
    app.useGlobalFilters(new any_exception_filter_1.AnyExceptionFilter());
    const options = new swagger_1.DocumentBuilder()
        .setTitle('通用后台')
        .setDescription('通用后台接口文档')
        .setVersion('1.0')
        .addTag('接口文档')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document);
    (0, nestjs_knife4j2_1.knife4jSetup)(app, [
        {
            name: '2.0 version',
            url: `/api-json`,
            swaggerVersion: '2.0',
            location: `/api-json`,
        },
    ]);
    const port = process.env.PORT ?? 9527;
    await app.listen(port);
    console.log(`🚀 应用启动成功！`);
    console.log(`📍 服务端口: ${port}`);
    console.log(`📖 API文档: http://localhost:${port}/doc.html`);
    console.log(`🔄 代理服务: http://localhost:${port}/adminApi/lowcodeApi/*`);
    console.log(`💡 使用方式: 将业务接口前缀改为 /adminApi/lowcodeApi/`);
}
bootstrap();
//# sourceMappingURL=main.js.map