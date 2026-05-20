import { IsString, IsOptional, IsNotEmpty, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetOpenIdByCodeDto {
  @ApiProperty({ description: '微信授权code', example: '001a7f007b0d1d4f02a2097f2dcc1d00JnFh' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}

export class GetAccessTokenDto {
  @ApiProperty({ description: '应用ID', example: 'wxxxxxxxxxxx', required: false })
  @IsString()
  @IsOptional()
  readonly appId?: string;

  @ApiProperty({ description: '应用密钥', example: 'xxxxxxxxxxxxxxxxxxxxxxx', required: false })
  @IsString()
  @IsOptional()
  readonly appSecret?: string;
}

export class GetUserInfoDto {
  @ApiProperty({ description: 'Access Token', example: 'ACCESS_TOKEN' })
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;

  @ApiProperty({ description: '用户OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  readonly openId: string;
}

export class SendTemplateMessageDto {
  @ApiProperty({ description: '接收者OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  readonly touser: string;

  @ApiProperty({ description: '模板ID', example: 'xxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  readonly template_id: string;

  @ApiProperty({ description: '点击模板消息跳转的URL', example: 'https://example.com', required: false })
  @IsString()
  @IsOptional()
  readonly url?: string;

  @ApiProperty({ description: '跳转小程序信息', required: false })
  @IsObject()
  @IsOptional()
  readonly miniprogram?: {
    appid: string;
    pagepath?: string;
  };

  @ApiProperty({ 
    description: '模板数据', 
    example: {
      first: { value: '恭喜你购买成功！', color: '#173177' },
      keyword1: { value: '巧克力', color: '#173177' },
      keyword2: { value: '39.8元', color: '#173177' },
      keyword3: { value: '2014年9月16日', color: '#173177' },
      remark: { value: '欢迎再次购买！', color: '#173177' }
    }
  })
  @IsObject()
  @IsNotEmpty()
  readonly data: Record<string, { value: string; color?: string }>;
}

export class SendCustomMessageDto {
  @ApiProperty({ description: '接收者OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  readonly touser: string;

  @ApiProperty({ description: '消息类型', example: 'text' })
  @IsString()
  @IsNotEmpty()
  readonly msgtype: string;

  @ApiProperty({ description: '消息内容', example: { content: '你好，这是一条测试消息' } })
  @IsObject()
  @IsNotEmpty()
  readonly message: any;
}

export class GenerateQRCodeDto {
  @ApiProperty({ description: '二维码类型', example: 'QR_LIMIT_SCENE' })
  @IsString()
  @IsNotEmpty()
  readonly action_name: string;

  @ApiProperty({ description: '二维码详细信息', example: { scene: { scene_str: 'test' } } })
  @IsObject()
  @IsNotEmpty()
  readonly action_info: any;

  @ApiProperty({ description: '过期时间(秒)', example: 604800, required: false })
  @IsOptional()
  readonly expire_seconds?: number;
}

export class WechatOAuthUrlDto {
  @ApiProperty({ description: '授权后重定向的回调链接地址', example: 'https://yourdomain.com/callback' })
  @IsString()
  @IsNotEmpty()
  readonly redirectUri: string;

  @ApiProperty({ description: '授权作用域', example: 'snsapi_userinfo', required: false })
  @IsString()
  @IsOptional()
  readonly scope?: string;

  @ApiProperty({ description: '重定向后会带上state参数', example: 'STATE', required: false })
  @IsString()
  @IsOptional()
  readonly state?: string;
}

export class GetJSSDKConfigDto {
  @ApiProperty({ description: '当前页面URL', example: 'https://yourdomain.com/page' })
  @IsString()
  @IsNotEmpty()
  readonly url: string;
}

export class BatchSendTemplateMessageDto {
  @ApiProperty({ 
    description: '接收者OpenID列表', 
    example: ['oxxxxxxxxxxxxxxxxxxxxxx1', 'oxxxxxxxxxxxxxxxxxxxxxx2', 'oxxxxxxxxxxxxxxxxxxxxxx3'] 
  })
  @IsString({ each: true })
  @IsNotEmpty()
  readonly tousers: string[];

  @ApiProperty({ description: '模板ID', example: 'xxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  readonly template_id: string;

  @ApiProperty({ description: '点击模板消息跳转的URL', example: 'https://example.com', required: false })
  @IsString()
  @IsOptional()
  readonly url?: string;

  @ApiProperty({ description: '跳转小程序信息', required: false })
  @IsObject()
  @IsOptional()
  readonly miniprogram?: {
    appid: string;
    pagepath?: string;
  };

  @ApiProperty({ 
    description: '模板数据', 
    example: {
      first: { value: '恭喜你购买成功！', color: '#173177' },
      keyword1: { value: '巧克力', color: '#173177' },
      keyword2: { value: '39.8元', color: '#173177' },
      keyword3: { value: '2014年9月16日', color: '#173177' },
      remark: { value: '欢迎再次购买！', color: '#173177' }
    }
  })
  @IsObject()
  @IsNotEmpty()
  readonly data: Record<string, { value: string; color?: string }>;

  @ApiProperty({ description: '是否并发发送', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  readonly concurrent?: boolean;

  @ApiProperty({ description: '延迟间隔(毫秒)', example: 100, required: false })
  @IsOptional()
  readonly delay?: number;
}
