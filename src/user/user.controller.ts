import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/user/addUser.dto';
import { LoginUserDto } from 'src/dto/user/loginUser.dto';
import { UpdateUserDto } from 'src/dto/user/updateUser.dto';
import { ResponseUserInterfaces } from 'src/user/types/userResponse.interface';
import { ExpressRequest } from 'src/types/expressRequest.interface';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new ValidationPipe())
  async register(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<ResponseUserInterfaces | { message: string }> {
    const newUser = await this.userService.addUser(createUserDto);

    if (newUser) return this.userService.buildUserResponse(newUser);
    return {
      message: 'this username already signup',
    };
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<ResponseUserInterfaces> {
    const existedUser = await this.userService.loginUser(loginUserDto);
    return existedUser;
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async getUser(
    @Req() request: ExpressRequest,
    @User(['username', 'email']) user: UserEntity,
  ): Promise<ResponseUserInterfaces> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User('id') user: UserEntity,
  ) {
    const userUpdateInfo = await this.userService.updateUser(
      user.id,
      updateUserDto,
    );
    return this.userService.buildUserResponse(userUpdateInfo);
  }
}
