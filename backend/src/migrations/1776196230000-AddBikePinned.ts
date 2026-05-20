import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBikePinned1776196230000 implements MigrationInterface {
  name = 'AddBikePinned1776196230000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBikesTable = await queryRunner.hasTable('bikes');
    if (!hasBikesTable) {
      return;
    }

    const hasPinnedColumn = await queryRunner.hasColumn('bikes', 'pinned');
    if (!hasPinnedColumn) {
      await queryRunner.query('ALTER TABLE "bikes" ADD "pinned" boolean NOT NULL DEFAULT false');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBikesTable = await queryRunner.hasTable('bikes');
    if (!hasBikesTable) {
      return;
    }

    const hasPinnedColumn = await queryRunner.hasColumn('bikes', 'pinned');
    if (hasPinnedColumn) {
      await queryRunner.query('ALTER TABLE "bikes" DROP COLUMN "pinned"');
    }
  }
}
