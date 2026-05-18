import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync(process.env.UPLOAD_DIR || 'uploads', { recursive: true });

  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
