import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleEntity } from './article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'src/guards/auth.guard';
import { FollowEntity } from 'src/profile/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, FollowEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, AuthGuard],
  exports: [],
})
export class ArticleModule {}
