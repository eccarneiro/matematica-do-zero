CREATE TABLE "lesson_progress" (
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"done" boolean NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "lesson_progress_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "topic_stats" (
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"correct" integer NOT NULL,
	"total" integer NOT NULL,
	"streak" integer NOT NULL,
	"best" integer NOT NULL,
	"level" smallint NOT NULL,
	"level_streak" integer NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "topic_stats_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_stats" ADD CONSTRAINT "topic_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;