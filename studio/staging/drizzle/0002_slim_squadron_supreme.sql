CREATE TABLE `studio_project_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`owner` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
