import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, pgEnum, unique } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "@auth/core/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `ulepszenia-com_${name}`);

// Enums
export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);

// Users table - extended with additional fields
export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull().unique(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  firstName: d.varchar({ length: 255 }),
  lastName: d.varchar({ length: 255 }),
  password: d.varchar({ length: 255 }), // For credentials auth
  dateOfBirth: d.date(),
  role: userRoleEnum("role").default('USER').notNull(),
  onboardingCompleted: d.boolean().default(false).notNull(),
  lastActiveAt: d.timestamp({ withTimezone: true }),
  totalListeningMinutes: d.integer().default(0),
  consecutiveDays: d.integer().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  playlists: many(playlists),
  progress: many(userProgress),
  favorites: many(userFavorites),
  achievements: many(userAchievements),
  challengeProgress: many(userChallengeProgress),
  quizAnswers: many(userQuizAnswers),
  activityLogs: many(activityLog),
  dailyActivitySummaries: many(dailyActivitySummary),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// App-specific tables

// Categories
export const categories = createTable(
  "category",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull().unique(),
    slug: d.varchar({ length: 255 }).notNull().unique(),
    description: d.text(),
    imageUrl: d.text(),
    color: d.varchar({ length: 7 }).notNull().default("#3B82F6"),
    icon: d.varchar({ length: 50 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("category_slug_idx").on(t.slug)],
);

// Activations (audio content)
export const activations = createTable(
  "activation",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    durationSeconds: d.integer().notNull(),
    audioUrl: d.text().notNull(), // From R2
    imageUrl: d.text().notNull(), // From R2
    categoryId: d
      .varchar({ length: 255 })
      .references(() => categories.id),
    status: d.varchar({ length: 20 }).notNull().default("published"), // draft, published, scheduled
    publishedAt: d.timestamp({ withTimezone: true }),
    scheduledAt: d.timestamp({ withTimezone: true }),
    featured: d.boolean().default(false).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("activation_category_idx").on(t.categoryId),
    index("activation_created_idx").on(t.createdAt),
  ],
);

// Playlists
export const playlists = createTable(
  "playlist",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("playlist_user_idx").on(t.userId)],
);

// Playlist items
export const playlistItems = createTable(
  "playlist_item",
  (d) => ({
    playlistId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    activationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => activations.id, { onDelete: 'cascade' }),
    position: d.integer().notNull(),
    addedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.playlistId, t.activationId] }),
    index("playlist_item_playlist_idx").on(t.playlistId),
  ],
);

// User progress tracking
export const userProgress = createTable(
  "user_progress",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => activations.id, { onDelete: 'cascade' }),
    listenCount: d.integer().default(0).notNull(),
    lastListenedAt: d.timestamp({ withTimezone: true }),
    isCompleted: d.boolean().default(false).notNull(),
    progressSeconds: d.integer().default(0).notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.activationId] }),
    index("user_progress_user_idx").on(t.userId),
  ],
);

// User favorites
export const userFavorites = createTable(
  "user_favorite",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => activations.id, { onDelete: 'cascade' }),
    favoritedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.activationId] }),
    index("user_favorite_user_idx").on(t.userId),
  ],
);

// Achievements
export const achievements = createTable(
  "achievement",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    badgeImageUrl: d.text(),
    milestone: d.integer(), // e.g., 1 for 1st activation, 5 for 5-day streak
    type: d.varchar({ length: 255 }).notNull(), // e.g., 'activation_count', 'streak_days', 'total_minutes'
  }),
);

// User achievements
export const userAchievements = createTable(
  "user_achievement",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    unlockedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.achievementId] }),
    index("user_achievement_user_idx").on(t.userId),
  ],
);

// Challenges
export const challenges = createTable(
  "challenge",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    imageUrl: d.text(),
    durationDays: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
);

// Challenge activations
export const challengeActivations = createTable(
  "challenge_activation",
  (d) => ({
    challengeId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    activationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => activations.id, { onDelete: 'cascade' }),
    dayNumber: d.integer().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.challengeId, t.activationId] }),
    index("challenge_activation_challenge_idx").on(t.challengeId),
  ],
);

// User challenge progress
export const userChallengeProgress = createTable(
  "user_challenge_progress",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    challengeId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    startedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedDays: d.integer().default(0).notNull(),
    isCompleted: d.boolean().default(false).notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.challengeId] }),
    index("user_challenge_progress_user_idx").on(t.userId),
  ],
);

// User quiz answers (for onboarding)
export const userQuizAnswers = createTable(
  "user_quiz_answer",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: d.varchar({ length: 255 }).notNull(),
    answer: d.text().notNull(),
    answeredAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("user_quiz_answer_user_idx").on(t.userId)],
);

// Activity log for tracking all user actions
export const activityLog = createTable(
  "activity_log",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: d.varchar({ length: 100 }).notNull(),
    entityType: d.varchar({ length: 50 }),
    entityId: d.varchar({ length: 255 }),
    metadata: d.jsonb(),
    ipAddress: d.varchar({ length: 45 }),
    userAgent: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("activity_log_user_idx").on(t.userId),
    index("activity_log_action_idx").on(t.action),
    index("activity_log_entity_idx").on(t.entityType, t.entityId),
    index("activity_log_created_idx").on(t.createdAt),
  ],
);

// Daily activity summary for aggregated stats
export const dailyActivitySummary = createTable(
  "daily_activity_summary",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: d.date().notNull(),
    listeningMinutes: d.integer().default(0).notNull(),
    activationsCompleted: d.integer().default(0).notNull(),
    articlesRead: d.integer().default(0).notNull(),
    achievementsUnlocked: d.integer().default(0).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    unique("daily_activity_summary_user_date_unique").on(t.userId, t.date),
    index("daily_activity_summary_user_date_idx").on(t.userId, t.date),
  ],
);

// Authors table
export const authors = createTable(
  "author",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    bio: d.text(),
    avatarUrl: d.text(),
    slug: d.varchar({ length: 255 }).notNull().unique(),
    userId: d
      .varchar({ length: 255 })
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("author_slug_idx").on(t.slug)],
);

// Tags table
export const tags = createTable(
  "tag",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull().unique(),
    slug: d.varchar({ length: 255 }).notNull().unique(),
    description: d.text(),
    color: d.varchar({ length: 7 }).notNull().default("#6B7280"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("tag_slug_idx").on(t.slug)],
);

// Articles table (for blogs and news)
export const articles = createTable(
  "article",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: d.varchar({ length: 255 }).notNull(),
    slug: d.varchar({ length: 255 }).notNull().unique(),
    content: d.text().notNull(),
    excerpt: d.text(),
    coverImageUrl: d.text(),
    authorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => authors.id),
    categoryId: d
      .varchar({ length: 255 })
      .references(() => categories.id),
    publishedAt: d.timestamp({ withTimezone: true }),
    status: d.varchar({ length: 20 }).notNull().default("draft"), // draft, published, scheduled
    type: d.varchar({ length: 20 }).notNull().default("blog"), // blog, news
    featured: d.boolean().default(false).notNull(),
    readTime: d.integer(), // estimated read time in minutes
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("article_slug_idx").on(t.slug),
    index("article_author_idx").on(t.authorId),
    index("article_status_idx").on(t.status),
    index("article_type_idx").on(t.type),
    index("article_published_idx").on(t.publishedAt),
  ],
);

// Article tags junction table
export const articleTags = createTable(
  "article_tag",
  (d) => ({
    articleId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    tagId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  }),
  (t) => [
    primaryKey({ columns: [t.articleId, t.tagId] }),
    index("article_tag_article_idx").on(t.articleId),
    index("article_tag_tag_idx").on(t.tagId),
  ],
);

// Article statistics
export const articleStats = createTable(
  "article_stats",
  (d) => ({
    articleId: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .references(() => articles.id, { onDelete: 'cascade' }),
    views: d.integer().default(0).notNull(),
    shares: d.integer().default(0).notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("article_stats_article_idx").on(t.articleId)],
);

// Ulepszenia collections for Odkrywaj and Wyzwania
export const ulepszeniaCollections = createTable(
  "ulepszenia_collection",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    description: d.text(),
    type: d.varchar({ length: 50 }).notNull(), // odkrywaj, wyzwania, featured
    isActive: d.boolean().default(true).notNull(),
    position: d.integer().default(0).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("ulepszenia_collection_type_idx").on(t.type)],
);

// Collection items junction table
export const collectionItems = createTable(
  "collection_item",
  (d) => ({
    collectionId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => ulepszeniaCollections.id, { onDelete: 'cascade' }),
    activationId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => activations.id, { onDelete: 'cascade' }),
    position: d.integer().notNull(),
    addedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.collectionId, t.activationId] }),
    index("collection_item_collection_idx").on(t.collectionId),
  ],
);

// Additional relations

export const activationRelations = relations(activations, ({ one, many }) => ({
  category: one(categories, {
    fields: [activations.categoryId],
    references: [categories.id],
  }),
  progress: many(userProgress),
  favorites: many(userFavorites),
  playlistItems: many(playlistItems),
  challengeActivations: many(challengeActivations),
  collectionItems: many(collectionItems),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  activations: many(activations),
}));

export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  items: many(playlistItems),
}));

export const playlistItemRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.id],
  }),
  activation: one(activations, {
    fields: [playlistItems.activationId],
    references: [activations.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  activation: one(activations, {
    fields: [userProgress.activationId],
    references: [activations.id],
  }),
}));

export const userFavoriteRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  activation: one(activations, {
    fields: [userFavorites.activationId],
    references: [activations.id],
  }),
}));

export const achievementRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const challengeRelations = relations(challenges, ({ many }) => ({
  activations: many(challengeActivations),
  userProgress: many(userChallengeProgress),
}));

export const challengeActivationRelations = relations(challengeActivations, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeActivations.challengeId],
    references: [challenges.id],
  }),
  activation: one(activations, {
    fields: [challengeActivations.activationId],
    references: [activations.id],
  }),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const userQuizAnswerRelations = relations(userQuizAnswers, ({ one }) => ({
  user: one(users, {
    fields: [userQuizAnswers.userId],
    references: [users.id],
  }),
}));

export const authorRelations = relations(authors, ({ one, many }) => ({
  user: one(users, {
    fields: [authors.userId],
    references: [users.id],
  }),
  articles: many(articles),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags),
}));

export const articleRelations = relations(articles, ({ one, many }) => ({
  author: one(authors, {
    fields: [articles.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  tags: many(articleTags),
  stats: one(articleStats),
}));

export const articleTagRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const articleStatsRelations = relations(articleStats, ({ one }) => ({
  article: one(articles, {
    fields: [articleStats.articleId],
    references: [articles.id],
  }),
}));

export const ulepszeniaCollectionRelations = relations(ulepszeniaCollections, ({ many }) => ({
  items: many(collectionItems),
}));

export const collectionItemRelations = relations(collectionItems, ({ one }) => ({
  collection: one(ulepszeniaCollections, {
    fields: [collectionItems.collectionId],
    references: [ulepszeniaCollections.id],
  }),
  activation: one(activations, {
    fields: [collectionItems.activationId],
    references: [activations.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const dailyActivitySummaryRelations = relations(dailyActivitySummary, ({ one }) => ({
  user: one(users, {
    fields: [dailyActivitySummary.userId],
    references: [users.id],
  }),
}));
