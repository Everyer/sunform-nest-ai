import { UtilService } from './util.service';
import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../system/auth/jwt-auth.guard';
@ApiTags('工具类')
@Controller('util')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
export class UtilController {
  constructor(private readonly utilService: UtilService) {
  }
  @Post('getLowcodeCode')
  async getLowcodeCode(@Body() dto: { componentCode: string }) {
    return await this.utilService.getLowcodeCode(dto.componentCode);
  }

  @Post('getExampleLowcodeCode')
  async getExampleLowcodeCode(@Body() dto: { componentCode: string }) {
    return await this.utilService.getExampleLowcodeCode(dto.componentCode);
  }
}
