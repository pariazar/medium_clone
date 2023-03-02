import { UserEntity } from 'src/user/user.entity';

export type ProfileType = UserEntity & { following: boolean };
