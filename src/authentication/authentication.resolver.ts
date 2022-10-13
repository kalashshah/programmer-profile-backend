import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import { SigninInput, SignupInput } from '../../src/graphql.types';

@Resolver('Authentication')
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation('signup')
  async signup(@Args('data') data: SignupInput) {
    return await this.authenticationService.signup(data);
  }

  @Mutation('signin')
  async signin(@Args('data') data: SigninInput) {
    data.email.toLowerCase();
    return await this.authenticationService.signin(data);
  }
}
