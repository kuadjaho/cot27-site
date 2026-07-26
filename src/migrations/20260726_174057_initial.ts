import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editeur');
  CREATE TYPE "public"."enum_participants_langue" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_inscriptions_options_selectionnees" AS ENUM('excursions', 'gala', 'totebag');
  CREATE TYPE "public"."enum_inscriptions_categorie" AS ENUM('early', 'standard', 'late', 'etudiant', 'delegation', 'vip');
  CREATE TYPE "public"."enum_inscriptions_devise" AS ENUM('XOF', 'USD', 'EUR');
  CREATE TYPE "public"."enum_inscriptions_statut" AS ENUM('en_attente', 'payee', 'annulee', 'remboursee');
  CREATE TYPE "public"."enum_inscriptions_mode_paiement" AS ENUM('fedapay', 'virement', 'sur_place');
  CREATE TYPE "public"."enum_inscriptions_canal" AS ENUM('mtn', 'moov', 'carte');
  CREATE TYPE "public"."enum_paiements_fournisseur" AS ENUM('fedapay', 'kkiapay', 'stripe');
  CREATE TYPE "public"."enum_paiements_devise" AS ENUM('XOF', 'USD', 'EUR');
  CREATE TYPE "public"."enum_paiements_statut" AS ENUM('initie', 'approuve', 'refuse', 'annule');
  CREATE TYPE "public"."enum_sessions_type" AS ENUM('keynote', 'atelier', 'panel', 'concours', 'ceremonie', 'business', 'social', 'pause');
  CREATE TYPE "public"."enum_sessions_langue" AS ENUM('fr', 'en', 'bilingue');
  CREATE TYPE "public"."enum_sponsors_palier" AS ENUM('platine', 'or', 'argent', 'bronze', 'institutionnel');
  CREATE TYPE "public"."enum_editions_type" AS ENUM('early-bird', 'officiel', 'post-conference');
  CREATE TYPE "public"."enum_articles_rubrique" AS ENUM('portrait', 'destination', 'conference', 'district', 'art-oratoire');
  CREATE TYPE "public"."enum_abonnes_langue" AS ENUM('fr', 'en');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar,
  	"role" "enum_users_role" DEFAULT 'editeur',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prenom" varchar NOT NULL,
  	"nom" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"telephone" varchar NOT NULL,
  	"pays" varchar DEFAULT 'Bénin',
  	"ville" varchar,
  	"club" varchar,
  	"district_role" varchar,
  	"langue" "enum_participants_langue" DEFAULT 'fr',
  	"regime_alimentaire" varchar,
  	"besoins_accessibilite" varchar,
  	"premiere_conference" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inscriptions_options_selectionnees" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_inscriptions_options_selectionnees",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "inscriptions_membres" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prenom" varchar,
  	"nom" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "inscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"participant_id" integer NOT NULL,
  	"categorie" "enum_inscriptions_categorie" NOT NULL,
  	"montant" numeric NOT NULL,
  	"devise" "enum_inscriptions_devise" DEFAULT 'XOF',
  	"statut" "enum_inscriptions_statut" DEFAULT 'en_attente',
  	"code_promo" varchar,
  	"nombre_participants" numeric DEFAULT 1,
  	"mode_paiement" "enum_inscriptions_mode_paiement" DEFAULT 'sur_place',
  	"canal" "enum_inscriptions_canal",
  	"qr_token" varchar,
  	"checked_in_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "paiements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"inscription_id" integer NOT NULL,
  	"fournisseur" "enum_paiements_fournisseur" NOT NULL,
  	"reference_externe" varchar,
  	"montant" numeric NOT NULL,
  	"devise" "enum_paiements_devise" DEFAULT 'XOF',
  	"statut" "enum_paiements_statut" DEFAULT 'initie',
  	"payload_webhook" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_sessions_type" NOT NULL,
  	"debut" timestamp(3) with time zone NOT NULL,
  	"fin" timestamp(3) with time zone,
  	"salle" varchar,
  	"langue" "enum_sessions_langue" DEFAULT 'fr',
  	"capacite" numeric,
  	"support_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions_locales" (
  	"titre" varchar NOT NULL,
  	"resume" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sessions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"intervenants_id" integer
  );
  
  CREATE TABLE "intervenants_distinctions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"distinction" varchar
  );
  
  CREATE TABLE "intervenants_reseaux" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plateforme" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "intervenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"pays" varchar,
  	"photo_id" integer,
  	"keynote" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "intervenants_locales" (
  	"titre" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sponsors_contreparties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "sponsors_contreparties_locales" (
  	"contrepartie" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"palier" "enum_sponsors_palier" NOT NULL,
  	"logo_id" integer,
  	"site_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "editions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_editions_type" NOT NULL,
  	"couverture_id" integer,
  	"publie_le" timestamp(3) with time zone NOT NULL,
  	"pdf_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "editions_locales" (
  	"titre" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"edition_id" integer NOT NULL,
  	"auteur" varchar NOT NULL,
  	"rubrique" "enum_articles_rubrique" NOT NULL,
  	"image_couverture_id" integer,
  	"temps_lecture" numeric,
  	"publie_le" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_locales" (
  	"titre" varchar NOT NULL,
  	"chapo" varchar NOT NULL,
  	"corps" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "abonnes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"langue" "enum_abonnes_langue" DEFAULT 'fr',
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "codes_promo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"reduction_pct" numeric NOT NULL,
  	"actif" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "brouillons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"etape" numeric DEFAULT 0,
  	"data" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"participants_id" integer,
  	"inscriptions_id" integer,
  	"paiements_id" integer,
  	"sessions_id" integer,
  	"intervenants_id" integer,
  	"sponsors_id" integer,
  	"editions_id" integer,
  	"articles_id" integer,
  	"abonnes_id" integer,
  	"codes_promo_id" integer,
  	"brouillons_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inscriptions_options_selectionnees" ADD CONSTRAINT "inscriptions_options_selectionnees_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inscriptions_membres" ADD CONSTRAINT "inscriptions_membres_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paiements" ADD CONSTRAINT "paiements_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions_locales" ADD CONSTRAINT "sessions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_intervenants_fk" FOREIGN KEY ("intervenants_id") REFERENCES "public"."intervenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "intervenants_distinctions" ADD CONSTRAINT "intervenants_distinctions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."intervenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "intervenants_reseaux" ADD CONSTRAINT "intervenants_reseaux_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."intervenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "intervenants" ADD CONSTRAINT "intervenants_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "intervenants_locales" ADD CONSTRAINT "intervenants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."intervenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sponsors_contreparties" ADD CONSTRAINT "sponsors_contreparties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sponsors_contreparties_locales" ADD CONSTRAINT "sponsors_contreparties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sponsors_contreparties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors_locales" ADD CONSTRAINT "sponsors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions" ADD CONSTRAINT "editions_couverture_id_media_id_fk" FOREIGN KEY ("couverture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editions" ADD CONSTRAINT "editions_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editions_locales" ADD CONSTRAINT "editions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_image_couverture_id_media_id_fk" FOREIGN KEY ("image_couverture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inscriptions_fk" FOREIGN KEY ("inscriptions_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paiements_fk" FOREIGN KEY ("paiements_id") REFERENCES "public"."paiements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_intervenants_fk" FOREIGN KEY ("intervenants_id") REFERENCES "public"."intervenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editions_fk" FOREIGN KEY ("editions_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abonnes_fk" FOREIGN KEY ("abonnes_id") REFERENCES "public"."abonnes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_codes_promo_fk" FOREIGN KEY ("codes_promo_id") REFERENCES "public"."codes_promo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brouillons_fk" FOREIGN KEY ("brouillons_id") REFERENCES "public"."brouillons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "participants_email_idx" ON "participants" USING btree ("email");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  CREATE INDEX "inscriptions_options_selectionnees_order_idx" ON "inscriptions_options_selectionnees" USING btree ("order");
  CREATE INDEX "inscriptions_options_selectionnees_parent_idx" ON "inscriptions_options_selectionnees" USING btree ("parent_id");
  CREATE INDEX "inscriptions_membres_order_idx" ON "inscriptions_membres" USING btree ("_order");
  CREATE INDEX "inscriptions_membres_parent_id_idx" ON "inscriptions_membres" USING btree ("_parent_id");
  CREATE INDEX "inscriptions_participant_idx" ON "inscriptions" USING btree ("participant_id");
  CREATE INDEX "inscriptions_qr_token_idx" ON "inscriptions" USING btree ("qr_token");
  CREATE INDEX "inscriptions_updated_at_idx" ON "inscriptions" USING btree ("updated_at");
  CREATE INDEX "inscriptions_created_at_idx" ON "inscriptions" USING btree ("created_at");
  CREATE INDEX "paiements_inscription_idx" ON "paiements" USING btree ("inscription_id");
  CREATE INDEX "paiements_reference_externe_idx" ON "paiements" USING btree ("reference_externe");
  CREATE INDEX "paiements_updated_at_idx" ON "paiements" USING btree ("updated_at");
  CREATE INDEX "paiements_created_at_idx" ON "paiements" USING btree ("created_at");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE UNIQUE INDEX "sessions_locales_locale_parent_id_unique" ON "sessions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sessions_rels_order_idx" ON "sessions_rels" USING btree ("order");
  CREATE INDEX "sessions_rels_parent_idx" ON "sessions_rels" USING btree ("parent_id");
  CREATE INDEX "sessions_rels_path_idx" ON "sessions_rels" USING btree ("path");
  CREATE INDEX "sessions_rels_intervenants_id_idx" ON "sessions_rels" USING btree ("intervenants_id");
  CREATE INDEX "intervenants_distinctions_order_idx" ON "intervenants_distinctions" USING btree ("_order");
  CREATE INDEX "intervenants_distinctions_parent_id_idx" ON "intervenants_distinctions" USING btree ("_parent_id");
  CREATE INDEX "intervenants_reseaux_order_idx" ON "intervenants_reseaux" USING btree ("_order");
  CREATE INDEX "intervenants_reseaux_parent_id_idx" ON "intervenants_reseaux" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "intervenants_slug_idx" ON "intervenants" USING btree ("slug");
  CREATE INDEX "intervenants_photo_idx" ON "intervenants" USING btree ("photo_id");
  CREATE INDEX "intervenants_updated_at_idx" ON "intervenants" USING btree ("updated_at");
  CREATE INDEX "intervenants_created_at_idx" ON "intervenants" USING btree ("created_at");
  CREATE UNIQUE INDEX "intervenants_locales_locale_parent_id_unique" ON "intervenants_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sponsors_contreparties_order_idx" ON "sponsors_contreparties" USING btree ("_order");
  CREATE INDEX "sponsors_contreparties_parent_id_idx" ON "sponsors_contreparties" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sponsors_contreparties_locales_locale_parent_id_unique" ON "sponsors_contreparties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sponsors_logo_idx" ON "sponsors" USING btree ("logo_id");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE UNIQUE INDEX "sponsors_locales_locale_parent_id_unique" ON "sponsors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "editions_slug_idx" ON "editions" USING btree ("slug");
  CREATE INDEX "editions_couverture_idx" ON "editions" USING btree ("couverture_id");
  CREATE INDEX "editions_pdf_idx" ON "editions" USING btree ("pdf_id");
  CREATE INDEX "editions_updated_at_idx" ON "editions" USING btree ("updated_at");
  CREATE INDEX "editions_created_at_idx" ON "editions" USING btree ("created_at");
  CREATE UNIQUE INDEX "editions_locales_locale_parent_id_unique" ON "editions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_edition_idx" ON "articles" USING btree ("edition_id");
  CREATE INDEX "articles_image_couverture_idx" ON "articles" USING btree ("image_couverture_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "abonnes_email_idx" ON "abonnes" USING btree ("email");
  CREATE INDEX "abonnes_updated_at_idx" ON "abonnes" USING btree ("updated_at");
  CREATE INDEX "abonnes_created_at_idx" ON "abonnes" USING btree ("created_at");
  CREATE UNIQUE INDEX "codes_promo_code_idx" ON "codes_promo" USING btree ("code");
  CREATE INDEX "codes_promo_updated_at_idx" ON "codes_promo" USING btree ("updated_at");
  CREATE INDEX "codes_promo_created_at_idx" ON "codes_promo" USING btree ("created_at");
  CREATE UNIQUE INDEX "brouillons_token_idx" ON "brouillons" USING btree ("token");
  CREATE INDEX "brouillons_updated_at_idx" ON "brouillons" USING btree ("updated_at");
  CREATE INDEX "brouillons_created_at_idx" ON "brouillons" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");
  CREATE INDEX "payload_locked_documents_rels_inscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("inscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_paiements_id_idx" ON "payload_locked_documents_rels" USING btree ("paiements_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_intervenants_id_idx" ON "payload_locked_documents_rels" USING btree ("intervenants_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_editions_id_idx" ON "payload_locked_documents_rels" USING btree ("editions_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_abonnes_id_idx" ON "payload_locked_documents_rels" USING btree ("abonnes_id");
  CREATE INDEX "payload_locked_documents_rels_codes_promo_id_idx" ON "payload_locked_documents_rels" USING btree ("codes_promo_id");
  CREATE INDEX "payload_locked_documents_rels_brouillons_id_idx" ON "payload_locked_documents_rels" USING btree ("brouillons_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "participants" CASCADE;
  DROP TABLE "inscriptions_options_selectionnees" CASCADE;
  DROP TABLE "inscriptions_membres" CASCADE;
  DROP TABLE "inscriptions" CASCADE;
  DROP TABLE "paiements" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "sessions_locales" CASCADE;
  DROP TABLE "sessions_rels" CASCADE;
  DROP TABLE "intervenants_distinctions" CASCADE;
  DROP TABLE "intervenants_reseaux" CASCADE;
  DROP TABLE "intervenants" CASCADE;
  DROP TABLE "intervenants_locales" CASCADE;
  DROP TABLE "sponsors_contreparties" CASCADE;
  DROP TABLE "sponsors_contreparties_locales" CASCADE;
  DROP TABLE "sponsors" CASCADE;
  DROP TABLE "sponsors_locales" CASCADE;
  DROP TABLE "editions" CASCADE;
  DROP TABLE "editions_locales" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "abonnes" CASCADE;
  DROP TABLE "codes_promo" CASCADE;
  DROP TABLE "brouillons" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_participants_langue";
  DROP TYPE "public"."enum_inscriptions_options_selectionnees";
  DROP TYPE "public"."enum_inscriptions_categorie";
  DROP TYPE "public"."enum_inscriptions_devise";
  DROP TYPE "public"."enum_inscriptions_statut";
  DROP TYPE "public"."enum_inscriptions_mode_paiement";
  DROP TYPE "public"."enum_inscriptions_canal";
  DROP TYPE "public"."enum_paiements_fournisseur";
  DROP TYPE "public"."enum_paiements_devise";
  DROP TYPE "public"."enum_paiements_statut";
  DROP TYPE "public"."enum_sessions_type";
  DROP TYPE "public"."enum_sessions_langue";
  DROP TYPE "public"."enum_sponsors_palier";
  DROP TYPE "public"."enum_editions_type";
  DROP TYPE "public"."enum_articles_rubrique";
  DROP TYPE "public"."enum_abonnes_langue";`)
}
