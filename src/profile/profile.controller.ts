import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ProfileResponseInterface } from 'src/user/types/profileResponse.interface';
import { UserEntity } from 'src/user/user.entity';
import { ProfileService } from './profile.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { DeleteResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Express } from 'express';

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

  @Post('avatar/upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @User() user: UserEntity,
  ): Promise<any> {
    await this.profileService.updateAvatar(user.username, file.filename);

    return file;
  }
}
