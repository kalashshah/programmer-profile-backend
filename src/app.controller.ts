import { Controller, Get, Query, Redirect, Render } from '@nestjs/common';
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
}
