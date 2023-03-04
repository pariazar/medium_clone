import { ArticleEntity } from '../article.entity';

export interface ArticlesResponseInterface {
  articles: ArticleEntity[];
  total: number;
}
