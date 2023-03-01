import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from 'src/dto/article/createArticle.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { UserEntity } from 'src/user/user.entity';
import { UpdateArticleDto } from 'src/dto/article/updateArticle.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(@User() user, @Query() query: any) {
    return await this.articleService.findArticle(user, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @Body('article') createArticle: CreateArticleDto,
    @User() user,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      createArticle,
      user,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticleBySlug(@Param() params): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(params.slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async deleteArticle(@Param('slug') slug: string, @User() user: UserEntity) {
    return await this.articleService.deleteArticle(user, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @Body('article') updateArticleDto: UpdateArticleDto,
    @User() user: UserEntity,
    @Param('slug') slug,
  ): Promise<ArticleResponseInterface> {
    const articleUpdateInfo = await this.articleService.updateArticle(
      updateArticleDto,
      user,
      slug,
    );
    return this.articleService.buildArticleResponse(articleUpdateInfo);
  }
}
