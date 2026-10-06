import { bigint, boolean, integer, pgTable, primaryKey, serial, smallint, text, timestamp } from 'drizzle-orm/pg-core';

/** Alunos que entraram com Google. id = "google:<sub>". */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull(),
    done: boolean('done').notNull(),
    /** Momento da mudança no aparelho do aluno (ms). Em conflito, vence o mais recente. */
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const topicStats = pgTable(
  'topic_stats',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    topicId: text('topic_id').notNull(),
    correct: integer('correct').notNull(),
    total: integer('total').notNull(),
    streak: integer('streak').notNull(),
    best: integer('best').notNull(),
    level: smallint('level').notNull(),
    levelStreak: integer('level_streak').notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.topicId] })],
);

/** XP ganho por dia (data local do aluno, AAAA-MM-DD). Em conflito, fica o maior. */
export const dailyXp = pgTable(
  'daily_xp',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    day: text('day').notNull(),
    xp: integer('xp').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** Feedback enviado pelos alunos (logados ou não). */
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  /** E-mail opcional de quem não está logado e quer resposta. */
  email: text('email'),
  /** Nota de 1 a 5 (opcional). */
  rating: smallint('rating'),
  message: text('message').notNull(),
  /** Página de onde veio o feedback. */
  page: text('page'),
  /** 'novo' | 'lido' */
  status: text('status').notNull().default('novo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
