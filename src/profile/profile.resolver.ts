import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AddUsernameInput, AuthorizeGithubInput } from 'src/graphql.types';
import { ProfileService } from './profile.service';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation('authorizeGithub')
  async authorizeGithub(
    @Args('input') input: AuthorizeGithubInput,
    @Context() context,
  ) {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return this.profileService.authorizeGithub(input, token);
  }

  @Mutation('addUsername')
  async addUsername(
    @Args('input') input: AddUsernameInput,
    @Context() context,
  ) {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return this.profileService.addUsername(input, token);
  }
}
