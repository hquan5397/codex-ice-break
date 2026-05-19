import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBikeSales1776196220000 implements MigrationInterface {
  name = 'CreateBikeSales1776196220000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const hasBikeSalesTable = await queryRunner.hasTable('bike_sales');
    if (hasBikeSalesTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "bike_sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bikeId" uuid NOT NULL,
        "saleAmount" numeric(12,2) NOT NULL,
        "soldAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_bike_sales_bikeId" UNIQUE ("bikeId"),
        CONSTRAINT "PK_bike_sales_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bike_sales_bikeId" FOREIGN KEY ("bikeId") REFERENCES "bikes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "bike_sales" ("bikeId", "saleAmount", "soldAt")
      SELECT "id", "price", "updatedAt"
      FROM "bikes"
      WHERE "sold" = true
      ON CONFLICT ("bikeId") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBikeSalesTable = await queryRunner.hasTable('bike_sales');
    if (hasBikeSalesTable) {
      await queryRunner.query('DROP TABLE "bike_sales"');
    }
  }
}
