import { Controller, Get, Post, Body, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WechatService } from './wechat.service';
import { 
  GetOpenIdByCodeDto,
  GetAccessTokenDto, 
  SendTemplateMessageDto,
  SendCustomMessageDto,
  GenerateQRCodeDto,
  WechatOAuthUrlDto,
  GetJSSDKConfigDto,
  GetUserInfoDto,
  BatchSendTemplateMessageDto
} from './dto/create-wechat.dto';
import { JwtAuthGuard } from '../../system/auth/jwt-auth.guard';

@ApiTags('微信公众号')
@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}

  @ApiOperation({ summary: '通过code换取openid和access_token' })
  @Post('getOpenIdByCode')
  async getOpenIdByCode(@Body() dto: GetOpenIdByCodeDto) {
    return await this.wechatService.getOpenIdByCode(dto);
  }

  @ApiOperation({ summary: '获取基础支持的access_token' })
  @ApiBearerAuth()
  @Post('getAccessToken')
  async getAccessToken(@Body() dto: GetAccessTokenDto) {
    return await this.wechatService.getAccessToken(dto.appId, dto.appSecret);
  }

  @ApiOperation({ summary: '获取用户基本信息' })
  @Post('getUserInfo')
  async getUserInfo(@Body() dto: GetUserInfoDto) {
    return await this.wechatService.getUserInfo(dto.accessToken, dto.openId);
  }

  @ApiOperation({ summary: '发送模板消息' })
  @ApiBearerAuth()
  @Post('sendTemplateMessage')
  async sendTemplateMessage(@Body() dto: SendTemplateMessageDto) {
    return await this.wechatService.sendTemplateMessage(dto);
  }

  @ApiOperation({ summary: '发送客服消息' })
  @ApiBearerAuth()
  @Post('sendCustomMessage')
  async sendCustomMessage(@Body() dto: SendCustomMessageDto) {
    return await this.wechatService.sendCustomMessage(dto);
  }

  @ApiOperation({ summary: '生成带参数二维码' })
  @ApiBearerAuth()
  @Post('generateQRCode')
  async generateQRCode(@Body() dto: GenerateQRCodeDto) {
    return await this.wechatService.generateQRCode(dto);
  }

  @ApiOperation({ summary: '生成微信授权链接' })
  @Post('generateOAuthUrl')
  async generateOAuthUrl(@Body() dto: WechatOAuthUrlDto) {
    return await this.wechatService.generateOAuthUrl(dto);
  }

  @ApiOperation({ summary: '获取JSSDK配置参数' })
  @Post('getJSSDKConfig')
  async getJSSDKConfig(@Body() dto: GetJSSDKConfigDto) {
    return await this.wechatService.getJSSDKConfig(dto);
  }

  @ApiOperation({ summary: '刷新网页授权access_token' })
  @Post('refreshAccessToken')
  async refreshAccessToken(@Body() dto: { refreshToken: string }) {
    return await this.wechatService.refreshAccessToken(dto.refreshToken);
  }

  @ApiOperation({ summary: '微信服务器验证接口' })
  @Get('verify')
  async verifyWechatSignature(
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ) {
    const isValid = await this.wechatService.verifySignature(signature, timestamp, nonce);
    if (isValid) {
      return echostr;
    }
    return 'Invalid signature';
  }

  @ApiOperation({ summary: '接收微信消息推送' })
  @Post('receive')
  async receiveMessage(@Body() body: any) {
    return await this.wechatService.handleMessage(body);
  }

  @ApiOperation({ summary: '微信消息推送处理(XML格式)' })
  @Post('message')
  async handleWechatMessage(
    @Body() body: string,
    @Headers('content-type') contentType: string
  ) {
    // 处理XML格式的微信消息
    if (contentType && contentType.includes('text/xml')) {
      // 这里可以添加XML解析逻辑
      console.log('收到XML消息:', body);
      return 'success';
    }
    
    return await this.wechatService.handleMessage(body);
  }

  @Post('batchSendTemplateMessage')
  @ApiOperation({ 
    summary: '批量发送模板消息',
    description: '一次性向多个用户发送相同的模板消息。支持串行发送（推荐）和并发发送两种模式。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '批量发送完成',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number', description: '总发送数量' },
            success: { type: 'number', description: '成功数量' },
            failed: { type: 'number', description: '失败数量' },
            successRate: { type: 'string', description: '成功率' }
          }
        },
        details: { type: 'array', description: '详细发送结果' },
        failedUsers: { type: 'array', description: '失败用户列表' }
      }
    }
  })
  async batchSendTemplateMessage(@Body() dto: BatchSendTemplateMessageDto) {
    return await this.wechatService.batchSendTemplateMessage(dto);
  }
}
