import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.setBaseViewsDir(join(__dirname, './', 'views'));
  app.setViewEngine('hbs');

  await app.listen(PORT);
}
bootstrap();
