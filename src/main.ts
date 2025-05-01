import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger';
import { useContainer, ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  // app.use(json({ limit: '50mb' }));
  // app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const message = Object.values(
          validationErrors[0].constraints || '',
        ).join(', ');
        return new BadRequestException(message);
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  setupSwagger(app);
  await app.listen(4000);
  // await app.listen(3000);
}
bootstrap();
