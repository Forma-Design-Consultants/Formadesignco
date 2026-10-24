import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const projects=sqliteTable('studio_preview_projects',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),updated:integer('updated').notNull(),expires:integer('expires').notNull()});
export const requests=sqliteTable('studio_preview_requests',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),created:integer('created').notNull(),expires:integer('expires').notNull()});
export const propertyUsage=sqliteTable('studio_property_usage',{id:text('id').primaryKey(),day:text('day').notNull(),n:integer('n').notNull()});
export const versions=sqliteTable('studio_project_versions',{id:text('id').primaryKey(),projectId:text('project_id').notNull(),owner:text('owner').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),created:integer('created').notNull(),expires:integer('expires').notNull()});
