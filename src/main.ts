import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { AnyExceptionFilter } from './common/filters/any-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { knife4jSetup } from 'nestjs-knife4j2'
import { UserIdInterceptor } from './common/interceptors/userid.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 开启全局 CORS 跨域，支持外部系统通过 Ajax 调用设计器相关免检接口
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // 配置请求体大小限制
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 设置全局前缀，但排除静态资源路径
  app.setGlobalPrefix('adminApi', {
    exclude: ['/static/*path']
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new UserIdInterceptor());
  // 配置验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    errorHttpStatusCode: 400,
  }));

  // 先注册验证异常过滤器
  app.useGlobalFilters(new ValidationExceptionFilter());
  // 全局异常兜底（捕获所有未处理的异常，返回统一格式）
  app.useGlobalFilters(new AnyExceptionFilter());
  const options = new DocumentBuilder()
    .setTitle('通用后台')
    .setDescription('通用后台接口文档')
    .setVersion('1.0')
    .addTag('接口文档')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)
  knife4jSetup(app, [
    {
      name: '2.0 version',
      url: `/api-json`,
      swaggerVersion: '2.0',
      location: `/api-json`,
    },
  ])

  const port = process.env.PORT ?? 9527;
  await app.listen(port);

  console.log(`🚀 应用启动成功！`);
  console.log(`📍 服务端口: ${port}`);
  console.log(`📖 API文档: http://localhost:${port}/doc.html`);
  console.log(`🔄 代理服务: http://localhost:${port}/adminApi/lowcodeApi/*`);
  console.log(`💡 使用方式: 将业务接口前缀改为 /adminApi/lowcodeApi/`);
}
bootstrap();
