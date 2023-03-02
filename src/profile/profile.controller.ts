import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ProfileResponseInterface } from 'src/user/types/profileResponse.interface';
import { UserEntity } from 'src/user/user.entity';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { DeleteResult } from 'typeorm';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get(':username')
  @UseGuards(AuthGuard)
  async getProfile(
    @User() user: UserEntity,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(username);
    return await this.profileService.buildProfileResponse(profile, user);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followUser(user, username);
    return await this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/unfollow')
  @UseGuards(AuthGuard)
  async unFollowUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ): Promise<DeleteResult> {
    return await this.profileService.unfollowUser(user, username);
  }
}
