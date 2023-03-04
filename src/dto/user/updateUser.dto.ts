import { IsEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsEmpty()
  readonly username: string;
  readonly email: string;
  readonly bio: string;
  readonly image: string;
}
