import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      inject: [],
      useFactory: async () => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'dorjoo',
            // username: 'postgres',
            password: 'root',
            database: 'eunit',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
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
