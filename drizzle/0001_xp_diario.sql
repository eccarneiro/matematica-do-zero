CREATE TABLE "daily_xp" (
	"user_id" text NOT NULL,
	"day" text NOT NULL,
	"xp" integer NOT NULL,
	CONSTRAINT "daily_xp_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
ALTER TABLE "daily_xp" ADD CONSTRAINT "daily_xp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;