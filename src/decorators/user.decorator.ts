import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.user) {
    null;
  }
  const newData = new UserEntity();
  if (Array.isArray(data)) {
    for (const atr of data) {
      newData[atr] = request.user[atr];
    }
    return newData;
  } else if (data) {
    newData[data] = request.user[data];

    return newData;
  }
  return request.user;
});
