CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "ulepszenia-com_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "ulepszenia-com_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_achievement" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"badgeImageUrl" text,
	"milestone" integer,
	"type" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_activation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"durationSeconds" integer NOT NULL,
	"audioUrl" text NOT NULL,
	"imageUrl" text NOT NULL,
	"categoryId" varchar(255),
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"publishedAt" timestamp with time zone,
	"scheduledAt" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_activity_log" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"entityType" varchar(50),
	"entityId" varchar(255),
	"metadata" jsonb,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_article_stats" (
	"articleId" varchar(255) PRIMARY KEY NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_article_tag" (
	"articleId" varchar(255) NOT NULL,
	"tagId" varchar(255) NOT NULL,
	CONSTRAINT "ulepszenia-com_article_tag_articleId_tagId_pk" PRIMARY KEY("articleId","tagId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_article" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"coverImageUrl" text,
	"authorId" varchar(255) NOT NULL,
	"categoryId" varchar(255),
	"publishedAt" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"type" varchar(20) DEFAULT 'blog' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"readTime" integer,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_author" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" text,
	"avatarUrl" text,
	"slug" varchar(255) NOT NULL,
	"userId" varchar(255),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_author_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"imageUrl" text,
	"color" varchar(7) DEFAULT '#3B82F6' NOT NULL,
	"icon" varchar(50),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_category_name_unique" UNIQUE("name"),
	CONSTRAINT "ulepszenia-com_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_challenge_activation" (
	"challengeId" varchar(255) NOT NULL,
	"activationId" varchar(255) NOT NULL,
	"dayNumber" integer NOT NULL,
	CONSTRAINT "ulepszenia-com_challenge_activation_challengeId_activationId_pk" PRIMARY KEY("challengeId","activationId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_challenge" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"imageUrl" text,
	"durationDays" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_collection_item" (
	"collectionId" varchar(255) NOT NULL,
	"activationId" varchar(255) NOT NULL,
	"position" integer NOT NULL,
	"addedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_collection_item_collectionId_activationId_pk" PRIMARY KEY("collectionId","activationId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_daily_activity_summary" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"listeningMinutes" integer DEFAULT 0 NOT NULL,
	"activationsCompleted" integer DEFAULT 0 NOT NULL,
	"articlesRead" integer DEFAULT 0 NOT NULL,
	"achievementsUnlocked" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "daily_activity_summary_user_date_unique" UNIQUE("userId","date")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_playlist_item" (
	"playlistId" varchar(255) NOT NULL,
	"activationId" varchar(255) NOT NULL,
	"position" integer NOT NULL,
	"addedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_playlist_item_playlistId_activationId_pk" PRIMARY KEY("playlistId","activationId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_playlist" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_tag" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#6B7280' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_tag_name_unique" UNIQUE("name"),
	CONSTRAINT "ulepszenia-com_tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_ulepszenia_collection" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user_achievement" (
	"userId" varchar(255) NOT NULL,
	"achievementId" varchar(255) NOT NULL,
	"unlockedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_user_achievement_userId_achievementId_pk" PRIMARY KEY("userId","achievementId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user_challenge_progress" (
	"userId" varchar(255) NOT NULL,
	"challengeId" varchar(255) NOT NULL,
	"startedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completedDays" integer DEFAULT 0 NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ulepszenia-com_user_challenge_progress_userId_challengeId_pk" PRIMARY KEY("userId","challengeId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user_favorite" (
	"userId" varchar(255) NOT NULL,
	"activationId" varchar(255) NOT NULL,
	"favoritedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_user_favorite_userId_activationId_pk" PRIMARY KEY("userId","activationId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user_progress" (
	"userId" varchar(255) NOT NULL,
	"activationId" varchar(255) NOT NULL,
	"listenCount" integer DEFAULT 0 NOT NULL,
	"lastListenedAt" timestamp with time zone,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"progressSeconds" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ulepszenia-com_user_progress_userId_activationId_pk" PRIMARY KEY("userId","activationId")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user_quiz_answer" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"questionId" varchar(255) NOT NULL,
	"answer" text NOT NULL,
	"answeredAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"firstName" varchar(255),
	"lastName" varchar(255),
	"password" varchar(255),
	"dateOfBirth" date,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"lastActiveAt" timestamp with time zone,
	"totalListeningMinutes" integer DEFAULT 0,
	"consecutiveDays" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ulepszenia-com_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ulepszenia-com_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "ulepszenia-com_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "ulepszenia-com_account" ADD CONSTRAINT "ulepszenia-com_account_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_activation" ADD CONSTRAINT "ulepszenia-com_activation_categoryId_ulepszenia-com_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."ulepszenia-com_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_activity_log" ADD CONSTRAINT "ulepszenia-com_activity_log_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_article_stats" ADD CONSTRAINT "ulepszenia-com_article_stats_articleId_ulepszenia-com_article_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."ulepszenia-com_article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_article_tag" ADD CONSTRAINT "ulepszenia-com_article_tag_articleId_ulepszenia-com_article_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."ulepszenia-com_article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_article_tag" ADD CONSTRAINT "ulepszenia-com_article_tag_tagId_ulepszenia-com_tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."ulepszenia-com_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_article" ADD CONSTRAINT "ulepszenia-com_article_authorId_ulepszenia-com_author_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."ulepszenia-com_author"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_article" ADD CONSTRAINT "ulepszenia-com_article_categoryId_ulepszenia-com_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."ulepszenia-com_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_author" ADD CONSTRAINT "ulepszenia-com_author_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_challenge_activation" ADD CONSTRAINT "ulepszenia-com_challenge_activation_challengeId_ulepszenia-com_challenge_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."ulepszenia-com_challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_challenge_activation" ADD CONSTRAINT "ulepszenia-com_challenge_activation_activationId_ulepszenia-com_activation_id_fk" FOREIGN KEY ("activationId") REFERENCES "public"."ulepszenia-com_activation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_collection_item" ADD CONSTRAINT "ulepszenia-com_collection_item_collectionId_ulepszenia-com_ulepszenia_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."ulepszenia-com_ulepszenia_collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_collection_item" ADD CONSTRAINT "ulepszenia-com_collection_item_activationId_ulepszenia-com_activation_id_fk" FOREIGN KEY ("activationId") REFERENCES "public"."ulepszenia-com_activation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_daily_activity_summary" ADD CONSTRAINT "ulepszenia-com_daily_activity_summary_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_playlist_item" ADD CONSTRAINT "ulepszenia-com_playlist_item_playlistId_ulepszenia-com_playlist_id_fk" FOREIGN KEY ("playlistId") REFERENCES "public"."ulepszenia-com_playlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_playlist_item" ADD CONSTRAINT "ulepszenia-com_playlist_item_activationId_ulepszenia-com_activation_id_fk" FOREIGN KEY ("activationId") REFERENCES "public"."ulepszenia-com_activation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_playlist" ADD CONSTRAINT "ulepszenia-com_playlist_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_session" ADD CONSTRAINT "ulepszenia-com_session_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_achievement" ADD CONSTRAINT "ulepszenia-com_user_achievement_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_achievement" ADD CONSTRAINT "ulepszenia-com_user_achievement_achievementId_ulepszenia-com_achievement_id_fk" FOREIGN KEY ("achievementId") REFERENCES "public"."ulepszenia-com_achievement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_challenge_progress" ADD CONSTRAINT "ulepszenia-com_user_challenge_progress_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_challenge_progress" ADD CONSTRAINT "ulepszenia-com_user_challenge_progress_challengeId_ulepszenia-com_challenge_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."ulepszenia-com_challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_favorite" ADD CONSTRAINT "ulepszenia-com_user_favorite_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_favorite" ADD CONSTRAINT "ulepszenia-com_user_favorite_activationId_ulepszenia-com_activation_id_fk" FOREIGN KEY ("activationId") REFERENCES "public"."ulepszenia-com_activation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_progress" ADD CONSTRAINT "ulepszenia-com_user_progress_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_progress" ADD CONSTRAINT "ulepszenia-com_user_progress_activationId_ulepszenia-com_activation_id_fk" FOREIGN KEY ("activationId") REFERENCES "public"."ulepszenia-com_activation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulepszenia-com_user_quiz_answer" ADD CONSTRAINT "ulepszenia-com_user_quiz_answer_userId_ulepszenia-com_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ulepszenia-com_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "ulepszenia-com_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "activation_category_idx" ON "ulepszenia-com_activation" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "activation_created_idx" ON "ulepszenia-com_activation" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "activity_log_user_idx" ON "ulepszenia-com_activity_log" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "activity_log_action_idx" ON "ulepszenia-com_activity_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "activity_log_entity_idx" ON "ulepszenia-com_activity_log" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "activity_log_created_idx" ON "ulepszenia-com_activity_log" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "article_stats_article_idx" ON "ulepszenia-com_article_stats" USING btree ("articleId");--> statement-breakpoint
CREATE INDEX "article_tag_article_idx" ON "ulepszenia-com_article_tag" USING btree ("articleId");--> statement-breakpoint
CREATE INDEX "article_tag_tag_idx" ON "ulepszenia-com_article_tag" USING btree ("tagId");--> statement-breakpoint
CREATE INDEX "article_slug_idx" ON "ulepszenia-com_article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_author_idx" ON "ulepszenia-com_article" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "article_status_idx" ON "ulepszenia-com_article" USING btree ("status");--> statement-breakpoint
CREATE INDEX "article_type_idx" ON "ulepszenia-com_article" USING btree ("type");--> statement-breakpoint
CREATE INDEX "article_published_idx" ON "ulepszenia-com_article" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "author_slug_idx" ON "ulepszenia-com_author" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "ulepszenia-com_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "challenge_activation_challenge_idx" ON "ulepszenia-com_challenge_activation" USING btree ("challengeId");--> statement-breakpoint
CREATE INDEX "collection_item_collection_idx" ON "ulepszenia-com_collection_item" USING btree ("collectionId");--> statement-breakpoint
CREATE INDEX "daily_activity_summary_user_date_idx" ON "ulepszenia-com_daily_activity_summary" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "playlist_item_playlist_idx" ON "ulepszenia-com_playlist_item" USING btree ("playlistId");--> statement-breakpoint
CREATE INDEX "playlist_user_idx" ON "ulepszenia-com_playlist" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "ulepszenia-com_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "tag_slug_idx" ON "ulepszenia-com_tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ulepszenia_collection_type_idx" ON "ulepszenia-com_ulepszenia_collection" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_achievement_user_idx" ON "ulepszenia-com_user_achievement" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_challenge_progress_user_idx" ON "ulepszenia-com_user_challenge_progress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_favorite_user_idx" ON "ulepszenia-com_user_favorite" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_progress_user_idx" ON "ulepszenia-com_user_progress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_quiz_answer_user_idx" ON "ulepszenia-com_user_quiz_answer" USING btree ("userId");