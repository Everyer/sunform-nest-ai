import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status;
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
    } else if (exception && (exception.constructor.name.startsWith('Sequelize') || (exception as any).name?.startsWith('Sequelize') || (exception as any).sqlState)) {
      const errMsg = (exception as Error).message || '';
      code = 400;
      status = HttpStatus.OK; // 返回 200 以便前端能优雅显示错误提示
      if (errMsg.includes('Data too long for column')) {
        const match = errMsg.match(/column '([^']+)'/i);
        const col = match ? match[1] : '未知字段';
        message = `【数据超长】字段「${col}」的长度超出了数据库限制，请缩短后重试。`;
      } else if (errMsg.includes('cannot be null') || errMsg.includes('doesn\'t have a default value')) {
        const match = errMsg.match(/column '([^']+)'|field '([^']+)'/i);
        const col = match ? (match[1] || match[2]) : '未知字段';
        message = `【必填缺失】字段「${col}」不能为空，请填入值后重试。`;
      } else if (errMsg.includes('Incorrect integer value') || errMsg.includes('Incorrect decimal value') || errMsg.includes('Incorrect double value')) {
        const match = errMsg.match(/column '([^']+)'/i);
        const col = match ? match[1] : '未知字段';
        message = `【类型错误】字段「${col}」格式错误，请确保填入的是数字或有效数值。`;
      } else if (errMsg.includes('Duplicate entry')) {
        const match = errMsg.match(/Duplicate entry '([^']+)' for key '([^']+)'/i);
        const val = match ? match[1] : '';
        message = `【数据冲突】值「${val}」在数据库中已存在，请勿重复添加。`;
      } else if (errMsg.includes('foreign key constraint fails')) {
        message = `【约束限制】操作失败，外键约束限制（可能所关联的父级或子级数据不存在）。`;
      } else {
        message = `【数据库发生错误】${errMsg}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message || '服务器内部错误';
    }

    response.status(status).json({
      success: false,
      code,
      message,
      data: null,
    });
  }
}
