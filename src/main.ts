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
<<<<<<< HEAD
  await app.listen(5050, 'localhost');
=======
  await app.listen(5050, '0.0.0.0');
>>>>>>> 1be88f271c48753360190e298cd7b0e0d36d945d
}
bootstrap();
