import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';
import { ProfileType } from './types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileResponseInterface } from 'src/user/types/profileResponse.interface';
import { FollowEntity } from './follow.entity';
import { DeleteResult } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository,
    @InjectRepository(FollowEntity) private readonly followRepository,
  ) {}

  async getProfile(profileUsername: string): Promise<ProfileType> {
    const userProfile = await this.userRepository.findOne(
      {
        username: profileUsername,
      },
      { select: ['username', 'bio', 'image'] },
    );
    if (!userProfile)
      throw new HttpException(
        'there is no user with this username',
        HttpStatus.NOT_FOUND,
      );
    return { ...userProfile, following: false };
  }

  async followUser(
    currentUser: UserEntity,
    targetUsername: string,
  ): Promise<ProfileType> {
    const targetUser = await this.userRepository.findOne({
      username: targetUsername,
    });

    if (targetUsername === currentUser.username)
      throw new HttpException(
        'you can not follow yourself',
        HttpStatus.BAD_REQUEST,
      );

    if (!targetUser)
      throw new HttpException(
        'target user not found to follow',
        HttpStatus.NOT_FOUND,
      );

    const followingStatus = await this.followRepository.findOne({
      followerId: currentUser.id,
      followingId: targetUser.id,
    });

    if (followingStatus)
      throw new HttpException(
        'this user followed already !',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const newFollowingStatus = new FollowEntity();
    newFollowingStatus.followerId = currentUser.id;
    newFollowingStatus.followingId = targetUser.id;

    await this.followRepository.save(newFollowingStatus);
    return { ...targetUser, following: true };
  }

  async unfollowUser(
    currentUser: UserEntity,
    targetUsername: string,
  ): Promise<DeleteResult> {
    const targetUser = await this.userRepository.findOne({
      username: targetUsername,
    });

    if (targetUsername === currentUser.username)
      throw new HttpException(
        'you can not unfollow yourself',
        HttpStatus.BAD_REQUEST,
      );

    if (!targetUser)
      throw new HttpException(
        'target user not found to follow',
        HttpStatus.NOT_FOUND,
      );

    const followingStatus = await this.followRepository.findOne({
      followerId: currentUser.id,
      followingId: targetUser.id,
    });

    if (!followingStatus)
      throw new HttpException(
        'you dont follow this account',
        HttpStatus.BAD_REQUEST,
      );

    return await this.followRepository.delete({ id: followingStatus.id });
  }

  async checkFollowStatus(
    currentUser: UserEntity,
    username: string,
  ): Promise<boolean> {
    const targetUser = await this.userRepository.findOne({
      username,
    });

    if (!targetUser)
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    const isFollow = await this.followRepository.findOne({
      followerId: currentUser.id,
      followingId: targetUser.id,
    });

    if (isFollow) return true;
    return false;
  }

  async updateAvatar(username: string, imagePath: string): Promise<boolean> {
    const targetUser = await this.userRepository.findOne({
      username,
    });
    const user = new UserEntity();
    if (!targetUser)
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    user.image = imagePath;
    Object.assign(targetUser, user);

    this.userRepository.save(targetUser);
    return true;
  }

  async buildProfileResponse(
    user,
    currentUser: UserEntity | null = null,
  ): Promise<ProfileResponseInterface> {
    delete user.email;

    if (!currentUser)
      return {
        profile: user,
      };

    return {
      profile: {
        ...user,
        following: await this.checkFollowStatus(currentUser, user.username),
      },
    };
  }
}
