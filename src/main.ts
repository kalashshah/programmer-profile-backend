import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.use(
  //   urlencoded({
  //     limit: '10mb',
  //     extended: true,
  //     parameterLimit: 50000,
  //   }),
  // );
  // app.use(json({ limit: '10mb' }));
  app.enableCors();
  app.setGlobalPrefix('api');
  app.setBaseViewsDir(join(__dirname, './', 'views'));
  app.setViewEngine('hbs');

  await app.listen(PORT);
}
bootstrap();
