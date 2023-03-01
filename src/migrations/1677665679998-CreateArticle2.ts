import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateArticle21677665679998 implements MigrationInterface {
    name = 'CreateArticle21677665679998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "slut" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "slut" DROP DEFAULT`);
    }

}
