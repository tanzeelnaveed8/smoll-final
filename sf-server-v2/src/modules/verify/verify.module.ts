import { ConfigService, ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('EMAIL_HOST') || 'localhost';
        const user = configService.get('EMAIL_USERNAME') || 'dev@localhost';
        const pass = configService.get('EMAIL_PASSWORD') || '';
        const port = configService.get('EMAIL_PORT') || 587;
        return {
          transport: {
            host,
            port: Number(port) || 587,
            secure: false,
            ignoreTLS: true,
            auth: { user, pass },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule {}
