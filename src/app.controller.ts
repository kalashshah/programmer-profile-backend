import {
  Controller,
  Get,
  Query,
  Redirect,
  Render,
  Post,
  Headers,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AppService } from './app.service';
import { GithubCallbackQuery } from './constants/profile.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello2();
  }

  @Get('/error')
  @Render('error')
  error(@Query('message') message: string) {
    return { message: message || 'Error' };
  }

  @Get('success')
  @Render('success')
  success(@Query('message') message: string) {
    return { message: message || 'Success' };
  }

  @Get('/github/callback')
  @Redirect()
  async githubCallback(@Query() query: GithubCallbackQuery) {
    try {
      const response = await this.appService.githubCallback(query);
      return { url: `/api/success?message=${response}` };
    } catch (error) {
      return { url: `/api/error?message=${error.message}` };
    }
  }

  @Post('/upload/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authorization: string,
    @Res() res: Response,
  ) {
    console.log('called');
    const token = authorization?.split(' ')[1];
    if (!token) {
      res.status(401).send('Invalid request, token not found');
    }
    if (!file) {
      res.status(400).send('Invalid request, file not found');
    }
    if (!file.mimetype.startsWith('image')) {
      res.status(400).send('Invalid request, file is not an image');
    }
    try {
      await this.appService.uploadProfilePicture(file, token);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
}
