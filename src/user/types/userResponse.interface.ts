import { UserType } from './user.type';

export interface ResponseUserInterfaces {
  user: UserType & { token: string };
}
