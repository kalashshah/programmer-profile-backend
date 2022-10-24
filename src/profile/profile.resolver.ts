import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import {
  AddUsernameInput,
  SearchInput,
  ToggleFollowInput,
  RestrictedUserSelf,
  RestrictedUserOther,
  PaginationInput,
} from 'src/graphql.types';
import { ProfileService } from './profile.service';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation('authorizeGithub')
  async authorizeGithub(@Context() context) {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return this.profileService.authorizeGithub(token);
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

  @Query('getUser')
  async getUser(@Context() context): Promise<RestrictedUserSelf> {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return await this.profileService.getUser(token);
  }

  @Query('search')
  async search(
    @Args('input') input: SearchInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return await this.profileService.search(input.query, input?.page || 1);
  }

  @Mutation('toggleFollow')
  async toggleFollow(
    @Args('input') input: ToggleFollowInput,
    @Context() context,
  ): Promise<string> {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return await this.profileService.toggleFollow(input, token);
  }

  @Query('getFollowers')
  async getFollowers(
    @Args('input') input: PaginationInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return await this.profileService.getFollowers(input?.page || 1, token);
  }

  @Query('getFollowing')
  async getFollowing(
    @Args('input') input: PaginationInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const authorization = context.req.headers.authorization;
    const token = authorization?.split(' ')[1];
    if (token === undefined)
      throw new Error('Invalid request, token not found');
    return await this.profileService.getFollowing(input?.page || 1, token);
  }
}
