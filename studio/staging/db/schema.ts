import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('studio_preview_projects',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),updated:integer('updated').notNull(),expires:integer('expires').notNull()});
export const requests=sqliteTable('studio_preview_requests',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),created:integer('created').notNull(),expires:integer('expires').notNull()});
