import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
       useFactory: async (configService: ConfigService) => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: Number(configService.get<string>('DB_PORT', '5432')),
            username: configService.get<string>('DB_USERNAME', 'dorjoo'),
            password: configService.get<string>('DB_PASSWORD', 'dorjooX0'),
            database: configService.get<string>('DB_NAME', 'eunit'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize:
              configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
          });

          return dataSource.initialize();
        } catch (error) {
          console.log(error);
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
