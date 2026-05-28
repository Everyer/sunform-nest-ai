import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  Req,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { AiService } from './ai.service';
import { AiLoggerService } from './utils/logger.service';
import {
  StreamChatDto,
  CompletionChatDto,
  GetModelsDto,
  BaseResponseDto,
  GetModelsResponseDto,
  CozeWorkflowRunDto,
  CozeWorkflowStreamRunDto,
  CozeWorkflowResponseDto
} from './dto/chat.dto';
import {
  VoiceCloneDto,
  TextToSpeechDto,
  VoiceCloneResponseDto
} from './dto/voice.dto';

@ApiTags('AI聊天')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly logger: AiLoggerService,
  ) {}

  @Post('stream')
  @ApiOperation({ 
    summary: '流式聊天接口',
    description: '支持实时流式响应的AI聊天接口，适用于需要即时反馈的场景'
  })
  @ApiBody({ 
    type: StreamChatDto,
    description: '流式聊天请求参数'
  })
  @ApiResponse({ 
    status: 200, 
    description: '流式响应成功',
    schema: {
      type: 'string',
      format: 'text/event-stream'
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '参数错误',
    type: BaseResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: '服务器错误',
    type: BaseResponseDto 
  })
  async streamChat(
    @Body(ValidationPipe) streamChatDto: StreamChatDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      // 参数验证
      if (!streamChatDto.messages || !Array.isArray(streamChatDto.messages) || streamChatDto.messages.length === 0) {
        throw new HttpException({
          error: '参数错误',
          message: 'messages 参数必须是非空数组'
        }, HttpStatus.BAD_REQUEST);
      }

      // 验证消息格式
      for (const message of streamChatDto.messages) {
        if (!message.role || !message.content) {
          throw new HttpException({
            error: '参数错误',
            message: '每条消息必须包含 role 和 content 字段'
          }, HttpStatus.BAD_REQUEST);
        }
      }

      // 设置响应头为流式传输
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // 获取流式响应
      const streamResponse = await this.aiService.streamChat(streamChatDto);
      
      // 处理流式响应并转发给客户端
      streamResponse.data.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        res.write(chunkStr);
      });

      streamResponse.data.on('end', () => {
        res.end();
      });

      streamResponse.data.on('error', (error) => {
        this.logger.error('流式响应错误', error);
        res.write(`data: {"error": "流式传输错误"}\n\n`);
        res.end();
      });

      // 处理客户端断开连接
      req.on('close', () => {
        this.logger.info('客户端断开连接');
        if (streamResponse.data && typeof streamResponse.data.destroy === 'function') {
          streamResponse.data.destroy();
        }
      });

    } catch (error: any) {
      this.logger.error('流式聊天控制器错误', error);
      
      if (!res.headersSent) {
        res.status(error.status || 500).json({
          error: '服务器错误',
          message: error.message || '未知错误'
        });
      }
    }
  }

  @Post('completions')
  @ApiOperation({ 
    summary: '非流式聊天接口',
    description: '返回完整响应的AI聊天接口，适用于一次性获取完整回复的场景'
  })
  @ApiBody({ 
    type: CompletionChatDto,
    description: '非流式聊天请求参数'
  })
  @ApiResponse({ 
    status: 200, 
    description: '聊天成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        object: { type: 'string' },
        created: { type: 'number' },
        model: { type: 'string' },
        choices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              message: {
                type: 'object',
                properties: {
                  role: { type: 'string' },
                  content: { type: 'string' }
                }
              },
              finish_reason: { type: 'string' }
            }
          }
        },
        usage: {
          type: 'object',
          properties: {
            prompt_tokens: { type: 'number' },
            completion_tokens: { type: 'number' },
            total_tokens: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '参数错误',
    type: BaseResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: '服务器错误',
    type: BaseResponseDto 
  })
  async completionChat(
    @Body(ValidationPipe) completionChatDto: CompletionChatDto
  ) {
    try {
      // 参数验证
      if (!completionChatDto.messages || !Array.isArray(completionChatDto.messages) || completionChatDto.messages.length === 0) {
        throw new HttpException({
          error: '参数错误',
          message: 'messages 参数必须是非空数组'
        }, HttpStatus.BAD_REQUEST);
      }

      // 调用AI服务
      const result = await this.aiService.completionChat(completionChatDto);
      return result;

    } catch (error: any) {
      this.logger.error('非流式聊天控制器错误', error);
      
      throw new HttpException({
        error: '服务器错误',
        message: error.message || '未知错误'
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('models')
  @ApiOperation({ 
    summary: '获取可用模型列表',
    description: '获取硅基流动平台支持的AI模型列表'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    description: '模型类型过滤',
    example: 'chat'
  })
  @ApiQuery({ 
    name: 'sub_type', 
    required: false, 
    description: '模型子类型过滤',
    example: 'completion'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取模型列表成功',
    type: GetModelsResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: '获取模型列表失败',
    type: BaseResponseDto 
  })
  async getModels(
    @Query() getModelsDto: GetModelsDto
  ): Promise<GetModelsResponseDto> {
    try {
      return await this.aiService.getModels(getModelsDto);
    } catch (error: any) {
      this.logger.error('获取模型列表控制器错误', error);
      
      return {
        success: false,
        error: '获取模型列表失败',
        message: error.message || '未知错误',
        data: [],
        total: 0
      };
    }
  }

  @Get('rules')
  @ApiOperation({ 
    summary: '获取可用规则类型',
    description: '获取所有可用的AI对话规则类型及其描述'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取规则类型成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getRuleTypes(): Promise<BaseResponseDto> {
    try {
      const ruleTypes = this.aiService.getAvailableRuleTypes();
      const rules = ruleTypes.map(type => ({
        type,
        description: this.aiService.getRuleDescription(type)
      }));

      return {
        success: true,
        data: rules
      };
    } catch (error: any) {
      this.logger.error('获取规则类型错误', error);
      
      return {
        success: false,
        error: '获取规则类型失败',
        message: error.message || '未知错误'
      };
    }
  }

  @Post('estimate-tokens')
  @ApiOperation({ 
    summary: '估算消息Token数量',
    description: '估算给定消息列表将消耗的Token数量'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              content: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token估算成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalTokens: { type: 'number' },
            messagesCount: { type: 'number' }
          }
        }
      }
    }
  })
  async estimateTokens(
    @Body() body: { messages: any[] }
  ): Promise<BaseResponseDto> {
    try {
      if (!body.messages || !Array.isArray(body.messages)) {
        throw new HttpException({
          error: '参数错误',
          message: 'messages 参数必须是数组'
        }, HttpStatus.BAD_REQUEST);
      }

      const totalTokens = this.aiService.estimateTokens(body.messages);

      return {
        success: true,
        data: {
          totalTokens,
          messagesCount: body.messages.length
        }
      };
    } catch (error: any) {
      this.logger.error('Token估算错误', error);
      
      return {
        success: false,
        error: 'Token估算失败',
        message: error.message || '未知错误'
      };
    }
  }

  @Post('coze/workflow/run')
  @ApiOperation({ 
    summary: '运行 Coze 工作流（非流式）',
    description: '运行指定的 Coze 工作流并返回完整结果'
  })
  @ApiBody({ 
    type: CozeWorkflowRunDto,
    description: 'Coze 工作流运行参数'
  })
  @ApiResponse({ 
    status: 200, 
    description: '工作流运行成功',
    type: CozeWorkflowResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: '参数错误',
    type: BaseResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: '服务器错误',
    type: BaseResponseDto 
  })
  async runCozeWorkflow(
    @Body(ValidationPipe) workflowDto: CozeWorkflowRunDto
  ): Promise<CozeWorkflowResponseDto> {
    try {
      // 参数验证
      if (!workflowDto.workflow_id) {
        throw new HttpException({
          error: '参数错误',
          message: 'workflow_id 参数不能为空'
        }, HttpStatus.BAD_REQUEST);
      }

      // 调用 Coze 工作流服务
      const result = await this.aiService.runCozeWorkflow(workflowDto);
      return result;

    } catch (error: any) {
      this.logger.error('Coze 工作流运行控制器错误', error);
      
      throw new HttpException({
        error: '服务器错误',
        message: error.message || '未知错误'
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('coze/workflow/stream')
  @ApiOperation({ 
    summary: '运行 Coze 工作流（流式）',
    description: '以流式方式运行指定的 Coze 工作流，支持实时响应'
  })
  @ApiBody({ 
    type: CozeWorkflowStreamRunDto,
    description: 'Coze 工作流流式运行参数'
  })
  @ApiResponse({ 
    status: 200, 
    description: '流式响应成功',
    schema: {
      type: 'string',
      format: 'text/event-stream'
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '参数错误',
    type: BaseResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: '服务器错误',
    type: BaseResponseDto 
  })
  async runCozeWorkflowStream(
    @Body(ValidationPipe) workflowDto: CozeWorkflowStreamRunDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      // 参数验证
      if (!workflowDto.workflow_id) {
        throw new HttpException({
          error: '参数错误',
          message: 'workflow_id 参数不能为空'
        }, HttpStatus.BAD_REQUEST);
      }

      // 设置响应头为流式传输
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // 获取流式响应
      const streamResponse = await this.aiService.runCozeWorkflowStream(workflowDto);
      
      // 处理流式响应并转发给客户端
      streamResponse.data.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        res.write(chunkStr);
      });

      streamResponse.data.on('end', () => {
        res.end();
      });

      streamResponse.data.on('error', (error) => {
        this.logger.error('Coze 工作流流式响应错误', error);
        res.write(`data: {"error": "流式传输错误"}\n\n`);
        res.end();
      });

      // 处理客户端断开连接
      req.on('close', () => {
        this.logger.info('客户端断开连接');
        if (streamResponse.data && typeof streamResponse.data.destroy === 'function') {
          streamResponse.data.destroy();
        }
      });

    } catch (error: any) {
      this.logger.error('Coze 工作流流式运行控制器错误', error);

      if (!res.headersSent) {
        res.status(error.status || 500).json({
          error: '服务器错误',
          message: error.message || '未知错误'
        });
      }
    }
  }

  @Post('voice/upload')
  @ApiOperation({
    summary: '上传音频文件',
    description: '上传音频文件到 MiniMax 平台，用于后续的音色克隆'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '音频文件（mp3/m4a/wav，最大20MB，10秒-5分钟）'
        },
        purpose: {
          type: 'string',
          enum: ['voice_clone', 'prompt_audio'],
          default: 'voice_clone',
          description: '用途：voice_clone（待克隆音频）或 prompt_audio（示例音频）'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        fileId: { type: 'string' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-wav'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new HttpException('仅支持 mp3、m4a、wav 格式的音频文件', HttpStatus.BAD_REQUEST), false);
      }
    }
  }))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('purpose') purpose: string = 'voice_clone'
  ) {
    try {
      if (!file) {
        throw new HttpException('请上传音频文件', HttpStatus.BAD_REQUEST);
      }

      const fileId = await this.aiService.uploadAudioFile(file, purpose);

      return {
        success: true,
        fileId
      };

    } catch (error: any) {
      this.logger.error('音频上传控制器错误', error);
      throw new HttpException({
        error: '上传失败',
        message: error.message || '未知错误'
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('voice/clone')
  @ApiOperation({
    summary: '音色克隆',
    description: '使用上传的音频文件克隆音色，并生成试听音频'
  })
  @ApiBody({
    type: VoiceCloneDto,
    description: '音色克隆请求参数'
  })
  @ApiResponse({
    status: 200,
    description: '克隆成功',
    type: VoiceCloneResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '参数错误',
    type: BaseResponseDto
  })
  async cloneVoice(
    @Body(ValidationPipe) voiceCloneDto: VoiceCloneDto
  ) {
    try {
      const result = await this.aiService.cloneVoice(
        voiceCloneDto.fileId as any,
        voiceCloneDto.voiceId,
        voiceCloneDto.text,
        {
          promptFileId: voiceCloneDto.promptFileId,
          promptText: voiceCloneDto.promptText,
          model: voiceCloneDto.model
        }
      );

      return {
        success: true,
        voiceId: voiceCloneDto.voiceId,
        audioUrl: result.audioUrl,
        audioBase64: result.audioBase64
      };

    } catch (error: any) {
      this.logger.error('音色克隆控制器错误', error);
      throw new HttpException({
        error: '克隆失败',
        message: error.message || '未知错误'
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('voice/tts')
  @ApiOperation({
    summary: '文字转语音',
    description: '使用指定音色将文字转换为语音'
  })
  @ApiBody({
    type: TextToSpeechDto,
    description: '文字转语音请求参数'
  })
  @ApiResponse({
    status: 200,
    description: '合成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        audioUrl: { type: 'string' },
        audioBase64: { type: 'string' }
      }
    }
  })
  async textToSpeech(
    @Body(ValidationPipe) textToSpeechDto: TextToSpeechDto
  ) {
    try {
      const result = await this.aiService.textToSpeech(
        textToSpeechDto.text,
        textToSpeechDto.voiceId,
        {
          model: textToSpeechDto.model,
          speed: textToSpeechDto.speed,
          volume: textToSpeechDto.volume,
          sampleRate: textToSpeechDto.sampleRate
        }
      );

      return {
        success: true,
        audioUrl: result.audioUrl,
        audioBase64: result.audioBase64
      };

    } catch (error: any) {
      this.logger.error('文字转语音控制器错误', error);
      throw new HttpException({
        error: '语音合成失败',
        message: error.message || '未知错误'
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
