import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/dto/user/addUser.dto';
import generateWebToken from 'src/utils/jwt';
import { ResponseUserInterfaces } from 'src/user/types/userResponse.interface';
import { LoginUserDto } from 'src/dto/user/loginUser.dto';
import { UpdateUserDto } from 'src/dto/user/updateUser.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async addUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }
  buildUserResponse(user: UserEntity): ResponseUserInterfaces {
    return {
      user: {
        ...user,
        token: generateWebToken({
          id: user.id,
          username: user.username,
          email: user.email,
        }),
      },
    };
  }
  async loginUser(loginUserDto: LoginUserDto): Promise<ResponseUserInterfaces> {
    const userAccount = await this.userRepository.findOne(
      {
        email: loginUserDto.email,
      },
      { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
    );

    if (!userAccount) {
      throw new HttpException(
        'Email or password is wrong or not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValidUser = await compare(
      loginUserDto.password,
      userAccount.password,
    );

    if (!isValidUser)
      throw new HttpException(
        'Email or password is wrong or not exist',
        HttpStatus.UNAUTHORIZED,
      );
    delete userAccount.password;
    return this.buildUserResponse(userAccount);
  }
  async findById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne(id);
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ username });
    if (!user) throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async updateUser(
    userId: number,
    userData: UpdateUserDto,
  ): Promise<UserEntity> {
    const userExisted = await this.findById(userId);
    const duplicateEmail = await this.userRepository.findOne({
      email: userData.email,
    });
    if (userExisted.email === userData.email) {
      throw new HttpException(
        'you choose this email already',
        HttpStatus.CONFLICT,
      );
    } else if (duplicateEmail)
      throw new HttpException('duplicate email enterd!', HttpStatus.CONFLICT);
    Object.assign(userExisted, userData);
    return await this.userRepository.save(userExisted);
  }
}
