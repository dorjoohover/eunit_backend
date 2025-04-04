import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.mn',
          port: 587,
          service: 'gmail',
          auth: {
            user: 'dorjoohover@gmail.mn',
            pass: 'jdvl irpq brii ldqz',
          },
        },
        defaults: {
          from: 'dorjoohover@gmail.mn',
        },
      }),
    }),
  ],
})
export class EmailModule {}
