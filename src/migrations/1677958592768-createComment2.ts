import {MigrationInterface, QueryRunner} from "typeorm";

export class createComment21677958592768 implements MigrationInterface {
    name = 'createComment21677958592768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_b302f2e474ce2a6cbacd7981aa5"`);
        await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "commentId" TO "articleId"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f"`);
        await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "articleId" TO "commentId"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_b302f2e474ce2a6cbacd7981aa5" FOREIGN KEY ("commentId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
