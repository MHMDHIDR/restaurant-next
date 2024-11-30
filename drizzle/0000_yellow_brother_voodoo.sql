DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."theme" AS ENUM('light', 'dark');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('SuperAdmin', 'VendorAdmin', 'VendorStaff', 'Customer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vendor_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "restaurant_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_menu_category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(255),
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_menu_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"category_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image" varchar(255),
	"is_available" boolean DEFAULT true,
	"preparation_time" integer,
	"allergens" json,
	"nutritional_info" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_order_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"menu_item_id" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"special_instructions" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_order" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) NOT NULL,
	"delivery_fee" numeric(10, 2),
	"total" numeric(10, 2) NOT NULL,
	"delivery_address" text,
	"special_instructions" text,
	"estimated_delivery_time" timestamp,
	"stripe_payment_intent_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_review" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"images" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"role" "role" DEFAULT 'Customer' NOT NULL,
	"email_verified" timestamp with time zone,
	"image" varchar(255),
	"theme" "theme" DEFAULT 'light',
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_vendor" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"logo" varchar(255),
	"cover_image" varchar(255) NOT NULL,
	"status" "vendor_status" DEFAULT 'PENDING' NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"opening_hours" json,
	"cuisine_types" json NOT NULL,
	"delivery_radius" integer,
	"minimum_order" numeric(10, 2),
	"average_rating" numeric(3, 2),
	"stripe_account_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurant_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "restaurant_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_account" ADD CONSTRAINT "restaurant_account_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_menu_category" ADD CONSTRAINT "restaurant_menu_category_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_menu_item" ADD CONSTRAINT "restaurant_menu_item_category_id_restaurant_menu_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."restaurant_menu_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_order_item" ADD CONSTRAINT "restaurant_order_item_order_id_restaurant_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."restaurant_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_order_item" ADD CONSTRAINT "restaurant_order_item_menu_item_id_restaurant_menu_item_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."restaurant_menu_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_order" ADD CONSTRAINT "restaurant_order_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_order" ADD CONSTRAINT "restaurant_order_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_order_id_restaurant_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."restaurant_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurant_session" ADD CONSTRAINT "restaurant_session_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "restaurant_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "restaurant_session" USING btree ("user_id");