import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1677427997375 implements MigrationInterface {
  name = 'SeedDb1677427997375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'),('coffee'),('nestjs')`,
    );

    await queryRunner.query(
      `INSERT INTO users (username,email,password) VALUES ('hamedpa','hamedpa21@gmail.com','$2b$10$eXxCWF9hp8AvYVE37qTXgOKTF5WjaunRvFc2FDmgbkST65juwWv7W')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug,title,description,body,"tagList", "authorId") VALUES ('first-article-abc','first article','first description' ,'first body','coffee,dragons',1),
       ('second-article-abc','second article','second description' ,'second body','nestJs,dragons',1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
