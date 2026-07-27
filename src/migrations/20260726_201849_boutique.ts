import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reservations_statut" AS ENUM('en_attente', 'confirmee', 'commandee', 'arrivee', 'remise', 'annulee');
  CREATE TYPE "public"."enum_reservations_mode_paiement" AS ENUM('sur_place', 'fedapay', 'virement');
  CREATE TABLE "epinglettes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"prix_fcfa" numeric NOT NULL,
  	"ref_ti" varchar,
  	"photo_url" varchar,
  	"ordre" numeric DEFAULT 100,
  	"actif" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "epinglettes_locales" (
  	"nom" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reservations_lignes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"nom" varchar NOT NULL,
  	"prix_unitaire" numeric NOT NULL,
  	"quantite" numeric NOT NULL
  );
  
  CREATE TABLE "reservations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"token" varchar,
  	"prenom" varchar NOT NULL,
  	"nom" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"telephone" varchar NOT NULL,
  	"club" varchar,
  	"pays" varchar,
  	"statut" "enum_reservations_statut" DEFAULT 'en_attente' NOT NULL,
  	"total_fcfa" numeric NOT NULL,
  	"mode_paiement" "enum_reservations_mode_paiement" DEFAULT 'sur_place',
  	"fedapay_transaction_id" varchar,
  	"note" varchar,
  	"payee_le" timestamp(3) with time zone,
  	"remise_le" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "boutique" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ouverte" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "boutique_locales" (
  	"delai_remise" varchar DEFAULT 'Remise pendant la conférence, du 1er au 8 mai 2027',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "epinglettes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reservations_id" integer;
  ALTER TABLE "epinglettes_locales" ADD CONSTRAINT "epinglettes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."epinglettes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reservations_lignes" ADD CONSTRAINT "reservations_lignes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "boutique_locales" ADD CONSTRAINT "boutique_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."boutique"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "epinglettes_slug_idx" ON "epinglettes" USING btree ("slug");
  CREATE INDEX "epinglettes_updated_at_idx" ON "epinglettes" USING btree ("updated_at");
  CREATE INDEX "epinglettes_created_at_idx" ON "epinglettes" USING btree ("created_at");
  CREATE UNIQUE INDEX "epinglettes_locales_locale_parent_id_unique" ON "epinglettes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reservations_lignes_order_idx" ON "reservations_lignes" USING btree ("_order");
  CREATE INDEX "reservations_lignes_parent_id_idx" ON "reservations_lignes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "reservations_reference_idx" ON "reservations" USING btree ("reference");
  CREATE UNIQUE INDEX "reservations_token_idx" ON "reservations" USING btree ("token");
  CREATE INDEX "reservations_email_idx" ON "reservations" USING btree ("email");
  CREATE INDEX "reservations_fedapay_transaction_id_idx" ON "reservations" USING btree ("fedapay_transaction_id");
  CREATE INDEX "reservations_updated_at_idx" ON "reservations" USING btree ("updated_at");
  CREATE INDEX "reservations_created_at_idx" ON "reservations" USING btree ("created_at");
  CREATE UNIQUE INDEX "boutique_locales_locale_parent_id_unique" ON "boutique_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_epinglettes_fk" FOREIGN KEY ("epinglettes_id") REFERENCES "public"."epinglettes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reservations_fk" FOREIGN KEY ("reservations_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_epinglettes_id_idx" ON "payload_locked_documents_rels" USING btree ("epinglettes_id");
  CREATE INDEX "payload_locked_documents_rels_reservations_id_idx" ON "payload_locked_documents_rels" USING btree ("reservations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "epinglettes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "epinglettes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reservations_lignes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reservations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "boutique" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "boutique_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "epinglettes" CASCADE;
  DROP TABLE "epinglettes_locales" CASCADE;
  DROP TABLE "reservations_lignes" CASCADE;
  DROP TABLE "reservations" CASCADE;
  DROP TABLE "boutique" CASCADE;
  DROP TABLE "boutique_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_epinglettes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reservations_fk";
  
  DROP INDEX "payload_locked_documents_rels_epinglettes_id_idx";
  DROP INDEX "payload_locked_documents_rels_reservations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "epinglettes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reservations_id";
  DROP TYPE "public"."enum_reservations_statut";
  DROP TYPE "public"."enum_reservations_mode_paiement";`)
}
