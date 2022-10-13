import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import { SignupInput } from './dto/signup.input';

@Resolver('Authentication')
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation('signup')
  async signup(@Args('data') data: SignupInput) {
    return await this.authenticationService.signup(data);
  }

  @Mutation('signin')
  async signin(@Args('data') data: SignupInput) {
    data.email.toLowerCase();
    return await this.authenticationService.signin(data);
  }
}
