import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../system/auth/auth.module';
import { UserModule } from '../../system/user/user.module';
import { StaffModule } from '../../system/staff/staff.module';
import { ImController } from './im.controller';
import { ImService } from './im.service';
import { ImGateway } from './im.gateway';
import { PresenceService } from './presence.service';
import { Conversation } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { User } from '../../system/user/entities/user.entity';
import { Staff } from '../../system/staff/entities/staff.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Conversation, ConversationMember, Message, MessageRead, User, Staff]),
    MulterModule.register({
      dest: './temp_attachments',
    }),
    AuthModule,
    UserModule,
    StaffModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
  ],
  controllers: [ImController],
  providers: [ImService, PresenceService, ImGateway],
  exports: [ImService, PresenceService],
})
export class ImModule {}
