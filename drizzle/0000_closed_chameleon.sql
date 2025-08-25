CREATE TYPE "public"."restaurant_order_status" AS ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."restaurant_theme" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."restaurant_user_role" AS ENUM('SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_STAFF', 'CUSTOMER');--> statement-breakpoint
CREATE TYPE "public"."restaurant_user_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."restaurant_vendor_status" AS ENUM('PENDING', 'ACTIVE', 'DEACTIVATED');--> statement-breakpoint
CREATE TABLE "restaurant_account" (
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
CREATE TABLE "restaurant_chat_message" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_chat_session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"vendor_id" varchar(255),
	"title" varchar(255) DEFAULT 'New Chat' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_menu_category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "restaurant_menu_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"category_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"image" varchar(255) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"preparation_time" integer NOT NULL,
	"allergens" json NOT NULL,
	"nutritional_info" json NOT NULL,
	"addons" json,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_notification" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_read" boolean DEFAULT false,
	"sound_played" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_order_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"menu_item_id" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"special_instructions" text
);
--> statement-breakpoint
CREATE TABLE "restaurant_order" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"status" "restaurant_order_status" DEFAULT 'PENDING' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"delivery_fee" numeric(10, 2),
	"total" numeric(10, 2) NOT NULL,
	"delivery_address" text NOT NULL,
	"special_instructions" text,
	"stripe_payment_intent_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_rate_limit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"ip_address" varchar(255) NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"last_request_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_review" (
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
CREATE TABLE "restaurant_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"role" "restaurant_user_role" DEFAULT 'CUSTOMER' NOT NULL,
	"status" "restaurant_user_status" DEFAULT 'PENDING' NOT NULL,
	"email_verified" timestamp with time zone,
	"image" varchar(255),
	"theme" "restaurant_theme" DEFAULT 'light' NOT NULL,
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "restaurant_vendor" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"added_by_id" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"logo" varchar(255) NOT NULL,
	"cover_image" varchar(255) NOT NULL,
	"status" "restaurant_vendor_status" DEFAULT 'PENDING' NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"opening_hours" json NOT NULL,
	"cuisine_types" json NOT NULL,
	"delivery_radius" integer NOT NULL,
	"minimum_order" numeric(10, 2) NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"stripe_account_id" varchar(255) DEFAULT '' NOT NULL,
	"admins" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"suspended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "restaurant_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "restaurant_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "restaurant_account" ADD CONSTRAINT "restaurant_account_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_chat_message" ADD CONSTRAINT "restaurant_chat_message_session_id_restaurant_chat_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."restaurant_chat_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_chat_session" ADD CONSTRAINT "restaurant_chat_session_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_chat_session" ADD CONSTRAINT "restaurant_chat_session_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_menu_category" ADD CONSTRAINT "restaurant_menu_category_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_menu_item" ADD CONSTRAINT "restaurant_menu_item_category_id_restaurant_menu_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."restaurant_menu_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_notification" ADD CONSTRAINT "restaurant_notification_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_order_item" ADD CONSTRAINT "restaurant_order_item_order_id_restaurant_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."restaurant_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_order_item" ADD CONSTRAINT "restaurant_order_item_menu_item_id_restaurant_menu_item_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."restaurant_menu_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_order" ADD CONSTRAINT "restaurant_order_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_order" ADD CONSTRAINT "restaurant_order_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_review" ADD CONSTRAINT "restaurant_review_order_id_restaurant_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."restaurant_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_session" ADD CONSTRAINT "restaurant_session_user_id_restaurant_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."restaurant_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "restaurant_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "restaurant_session" USING btree ("user_id");