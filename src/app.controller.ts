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
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ) {
    console.log('called');
    const token = authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid request, token not found');
    }
    if (!file) {
      throw new BadRequestException('Invalid request, file not found');
    }
    if (!file.mimetype.startsWith('image')) {
      throw new BadRequestException('Invalid request, file is not an image');
    }
    return await this.appService.uploadProfilePicture(file, token);
  }
}
