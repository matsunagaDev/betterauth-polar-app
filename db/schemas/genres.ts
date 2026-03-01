import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ジャンルテーブル
export const genres = sqliteTable('genres', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
});
