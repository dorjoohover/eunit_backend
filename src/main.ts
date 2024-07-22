import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api')
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  setupSwagger(app)
  await app.listen(5050);
}
bootstrap();
