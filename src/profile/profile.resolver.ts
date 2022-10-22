import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthorizeGithubInput } from 'src/graphql.types';
import { ProfileService } from './profile.service';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation('authorizeGithub')
  async authorizeGithub(@Args('input') input: AuthorizeGithubInput) {
    return this.profileService.authorizeGithub(input);
  }
}
