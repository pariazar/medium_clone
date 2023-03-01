import {MigrationInterface, QueryRunner} from "typeorm";

export class FixSlug1677669620191 implements MigrationInterface {
    name = 'FixSlug1677669620191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "slut" TO "slug"`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "slug" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "slug" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "articles" RENAME COLUMN "slug" TO "slut"`);
    }

}
