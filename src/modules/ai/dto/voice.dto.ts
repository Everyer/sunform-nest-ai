import { IsString, IsOptional, IsIn, IsNumber, IsNumberString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 语音克隆请求DTO
 */
export class VoiceCloneDto {
  @ApiProperty({
    description: '复刻音频的 file_id（通过上传接口获得）',
    example: 1234567890
  })
  @IsNumber()
  @Type(() => Number)
  fileId: number;

  @ApiProperty({
    description: '自定义的音色 ID（8-20个字符，仅支持字母、数字和下划线）',
    example: 'my_custom_voice'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'voiceId 只能包含字母、数字和下划线' })
  voiceId: string;

  @ApiPropertyOptional({
    description: '示例音频的 file_id（可选，用于增强克隆效果）',
    example: 'file_0987654321'
  })
  @IsOptional()
  @IsString()
  promptFileId?: string;

  @ApiPropertyOptional({
    description: '示例音频对应的文本（配合 promptFileId 使用）',
    example: '这是一段示例文本'
  })
  @IsOptional()
  @IsString()
  promptText?: string;

  @ApiProperty({
    description: '用于试听的文本内容',
    example: '你好，这是一段测试语音'
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: '使用的语音模型',
    enum: ['speech-2.8-hd', 'speech-2.6-hd', 'speech-02-hd'],
    default: 'speech-02-hd'
  })
  @IsOptional()
  @IsString()
  @IsIn(['speech-2.8-hd', 'speech-2.6-hd', 'speech-02-hd'])
  model?: string;
}

/**
 * 语音合成请求DTO
 */
export class TextToSpeechDto {
  @ApiProperty({
    description: '要合成语音的文本内容',
    example: '你好，欢迎使用语音合成服务'
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: '使用的音色 ID（可以是系统预设或克隆的音色）',
    example: 'male-qn-qingse'
  })
  @IsString()
  voiceId: string;

  @ApiPropertyOptional({
    description: '使用的语音模型',
    enum: ['speech-2.8-hd', 'speech-2.6-hd', 'speech-02-hd'],
    default: 'speech-02-hd'
  })
  @IsOptional()
  @IsString()
  @IsIn(['speech-2.8-hd', 'speech-2.6-hd', 'speech-02-hd'])
  model?: string;

  @ApiPropertyOptional({
    description: '语速（0.5-2.0）',
    example: 1.0
  })
  @IsOptional()
  speed?: number;

  @ApiPropertyOptional({
    description: '音量（0.5-2.0）',
    example: 1.0
  })
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({
    description: '采样率',
    enum: [8000, 16000, 22050, 24000, 44100],
    default: 24000
  })
  @IsOptional()
  sampleRate?: number;
}

/**
 * 语音克隆响应DTO
 */
export class VoiceCloneResponseDto {
  @ApiProperty({
    description: '是否成功',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '音色 ID',
    example: 'my_custom_voice'
  })
  voiceId: string;

  @ApiProperty({
    description: '试听音频 URL',
    example: 'https://example.com/audio.mp3'
  })
  audioUrl: string;

  @ApiProperty({
    description: '音频 base64 数据',
    example: 'data:audio/mp3;base64,...'
  })
  audioBase64: string;
}
