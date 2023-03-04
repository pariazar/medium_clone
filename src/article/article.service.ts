import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from 'src/dto/article/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { DeleteResult, Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from 'src/dto/article/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from 'src/profile/follow.entity';
import { CreateCommentDto } from 'src/dto/article/createComment.dto';
import { CommentEntity } from './comment.entity';
import { CommentResponseInterface } from './types/commentResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async findArticle(
    user: UserEntity,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.author) {
      queryBuilder.andWhere({
        'author.id': user.id,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList like :tag', {
        tag: `%${query.tag}%`,
      });
    }
    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const total = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    const articles = await queryBuilder.getMany();

    return { articles, total };
  }
  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    return {
      comment,
    };
  }
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article,
    };
  }
  async createArticle(
    createArticle: CreateArticleDto,
    currentUser: UserEntity,
  ): Promise<ArticleEntity> {
    const newArticle = new ArticleEntity();
    Object.assign(newArticle, createArticle);
    if (!createArticle.tagList) {
      newArticle.tagList = [];
    }
    newArticle.slug = this.getSlug(newArticle.title);

    newArticle.author = currentUser;
    const finalArticle = await this.articleRepository.save(newArticle);
    return finalArticle;
  }
  async createComment(
    createComment: CreateCommentDto,
    slug: string,
    currentUser: UserEntity,
  ): Promise<CommentEntity> {
    const article = await this.articleRepository.findOne({
      slug,
    });
    if (!article)
      throw new HttpException('there is no article', HttpStatus.NOT_FOUND);

    const newComment = new CommentEntity();
    Object.assign(newComment, createComment);
    if (!createComment.body) {
      throw new HttpException('cant comment be empty', HttpStatus.BAD_REQUEST);
    }

    newComment.author = currentUser;
    newComment.article = article;
    const finalComment = await this.commentRepository.save(newComment);
    return finalComment;
  }

  async getComments(slug: string): Promise<CommentEntity[]> {
    const article = await this.articleRepository.findOne({ slug });
    if (!article)
      throw new HttpException('there is no article', HttpStatus.NOT_FOUND);

    const comments = await this.commentRepository.find({ article });

    return comments;
  }

  async deleteComment(
    commentId: number,
    slug,
    currentUser: UserEntity,
  ): Promise<DeleteResult> {
    const article = await this.articleRepository.findOne({
      slug,
    });
    if (!article)
      throw new HttpException('there is no article', HttpStatus.NOT_FOUND);

    const comment = await this.commentRepository.findOne({
      id: commentId,
      article,
    });
    if (!comment)
      throw new HttpException(
        `there is no comment with ${String(comment)} id`,
        HttpStatus.NOT_FOUND,
      );

    if (comment.author.id !== currentUser.id)
      throw new HttpException(
        'you cant delete other comments',
        HttpStatus.FORBIDDEN,
      );

    return await this.commentRepository.delete({ id: commentId });
  }
  async getFeed(
    currentUser: UserEntity,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const followingUsers = await this.followRepository.find({
      followerId: currentUser.id,
    });

    if (!followingUsers) return { articles: [], total: 0 };

    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    queryBuilder.andWhere('articles.author.id IN (:...userId)', {
      userId: followingUsers.map((following) => following.followingId),
    });

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList like :tag', {
        tag: `%${query.tag}%`,
      });
    }

    const total = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, total };
  }

  async deleteArticle(user: UserEntity, slug: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (!article)
      throw new HttpException('article not existed', HttpStatus.NOT_FOUND);

    if (article.author.id !== user.id)
      throw new HttpException(
        `author has no access to delete ${article.slug} article`,
        HttpStatus.FORBIDDEN,
      );

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    updateArticle: UpdateArticleDto,
    user: UserEntity,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (!article)
      throw new HttpException('article not existed', HttpStatus.NOT_FOUND);

    if (article.author.id !== user.id)
      throw new HttpException(
        `author has no access to modify ${article.slug} article`,
        HttpStatus.FORBIDDEN,
      );

    if (updateArticle?.title) {
      if (article.title !== updateArticle.title) {
        article.slug = this.getSlug(updateArticle.title);
      }
    }
    Object.assign(article, updateArticle);

    const finalArticle = await this.articleRepository.save(article);
    return finalArticle;
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ slug });
    if (!article)
      throw new HttpException('slug not found', HttpStatus.NOT_FOUND);
    return article;
  }
  private getSlug(title: string): string {
    return (
      slugify(title, {
        lower: true,
      }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
