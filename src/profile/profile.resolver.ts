import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import {
  AddUsernameInput,
  SearchInput,
  ToggleFollowInput,
  RestrictedUserSelf,
  RestrictedUserOther,
  DescriptionInput,
  PaginatedUserInput,
  UserIdInput,
} from 'src/graphql.types';
import { ProfileService } from './profile.service';
import { getToken } from 'src/constants/decode';

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation('authorizeGithub')
  async authorizeGithub(@Context() context) {
    const token = getToken(context);
    return this.profileService.authorizeGithub(token);
  }

  @Mutation('addUsername')
  async addUsername(
    @Args('input') input: AddUsernameInput,
    @Context() context,
  ) {
    const token = getToken(context);
    return this.profileService.addUsername(input, token);
  }

  @Query('getUser')
  async getUser(@Context() context): Promise<RestrictedUserSelf> {
    const token = getToken(context);
    return await this.profileService.getUser(token);
  }

  @Query('getUserById')
  async getUserById(
    @Args('input') input: UserIdInput,
    @Context() context,
  ): Promise<RestrictedUserOther> {
    const token = getToken(context);
    return await this.profileService.getUserById(input.userId, token);
  }

  @Query('search')
  async search(
    @Args('input') input: SearchInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const token = getToken(context);
    return await this.profileService.search(
      input.query,
      input?.page || 1,
      token,
    );
  }

  @Mutation('toggleFollow')
  async toggleFollow(
    @Args('input') input: ToggleFollowInput,
    @Context() context,
  ): Promise<string> {
    const token = getToken(context);
    return await this.profileService.toggleFollow(input, token);
  }

  @Query('getFollowers')
  async getFollowers(
    @Args('input') input: PaginatedUserInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const token = getToken(context);
    return await this.profileService.getFollowers(
      input?.page || 1,
      input.userId,
      token,
    );
  }

  @Query('getFollowing')
  async getFollowing(
    @Args('input') input: PaginatedUserInput,
    @Context() context,
  ): Promise<RestrictedUserOther[]> {
    const token = getToken(context);
    return await this.profileService.getFollowing(
      input?.page || 1,
      input.userId,
      token,
    );
  }

  @Mutation('addDescription')
  async addDescription(
    @Args('input') input: DescriptionInput,
    @Context() context,
  ): Promise<string> {
    const token = getToken(context);
    return await this.profileService.addDescription(input.description, token);
  }
}
