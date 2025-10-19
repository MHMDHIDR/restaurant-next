CREATE TYPE "public"."restaurant_payout_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "restaurant_payout" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"vendor_id" varchar(255) NOT NULL,
	"stripe_payout_id" varchar(255) NOT NULL,
	"stripe_account_id" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'gbp' NOT NULL,
	"status" "restaurant_payout_status" NOT NULL,
	"arrival_date" timestamp NOT NULL,
	"method" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"failure_code" varchar(100),
	"failure_message" text,
	"stripe_payout_data" json NOT NULL,
	"balance_transactions" json,
	"pdf_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restaurant_payout_stripe_payout_id_unique" UNIQUE("stripe_payout_id")
);
--> statement-breakpoint
ALTER TABLE "restaurant_payout" ADD CONSTRAINT "restaurant_payout_vendor_id_restaurant_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."restaurant_vendor"("id") ON DELETE no action ON UPDATE no action;