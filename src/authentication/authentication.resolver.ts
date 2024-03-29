import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import {
  CheckCodeInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SigninInput,
  SignupInput,
} from '../../src/graphql.types';

@Resolver('Authentication')
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation('signup')
  async signup(@Args('input') input: SignupInput) {
    return await this.authenticationService.signup(input);
  }

  @Mutation('signin')
  async signin(@Args('input') input: SigninInput) {
    return await this.authenticationService.signin(input);
  }

  @Mutation('checkCode')
  async checkCode(@Args('input') input: CheckCodeInput) {
    return await this.authenticationService.checkCode(input);
  }

  @Mutation('forgotPassword')
  async forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return await this.authenticationService.forgotPassword(input);
  }

  @Mutation('resetPassword')
  async resetPassword(@Args('input') input: ResetPasswordInput) {
    return await this.authenticationService.resetPassword(input);
  }
}
