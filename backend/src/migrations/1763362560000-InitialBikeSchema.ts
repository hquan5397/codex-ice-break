import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialBikeSchema1763362560000 implements MigrationInterface {
  name = 'InitialBikeSchema1763362560000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const hasBikesTable = await queryRunner.hasTable('bikes');
    if (hasBikesTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "bikes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(160) NOT NULL,
        "price" numeric(12,2) NOT NULL,
        "brand" character varying(80),
        "model" character varying(80),
        "year" integer,
        "mileage" integer,
        "description" text,
        "imageUrl" character varying NOT NULL,
        "imageUrls" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "sold" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bikes_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBikesTable = await queryRunner.hasTable('bikes');
    if (hasBikesTable) {
      await queryRunner.query('DROP TABLE "bikes"');
    }
  }
}
