import { relations, sql } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('tdl_user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image')
})

export const accounts = pgTable(
  'tdl_account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessions = pgTable('tdl_session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull()
})

export const verificationTokens = pgTable(
  'tdl_verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
)

export const posts = pgTable('tdl_post', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  titleAr: text('titleAr').notNull(),
  content: text('content').notNull(),
  contentAr: text('contentAr').notNull(),
  isPublished: boolean('isPublished').notNull().default(false),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull()
})

export const projects = pgTable('tdl_project', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  titleAr: text('titleAr').notNull(),
  description: text('description').notNull(),
  descriptionAr: text('descriptionAr').notNull(),
  url: text('url').notNull(),
  images: text('images')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull()
})

export const layoutEnum = pgEnum('layout', ['dotted', 'grid', 'grid-small'])

export const settings = pgTable('tdl_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  layout: layoutEnum('layout').notNull().default('dotted')
})

/*
 * This is a relation between posts and users,
 * it means that each post is owned by a user
 */
export const usersRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  })
}))
