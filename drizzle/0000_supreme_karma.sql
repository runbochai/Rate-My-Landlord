CREATE TABLE `landlords` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`district` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_landlords_identity` ON `landlords` (`name`,`city`,`district`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`reason` text NOT NULL,
	`session` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reports_session_review` ON `reports` (`session`,`review_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`landlord_id` text NOT NULL,
	`session` text NOT NULL,
	`maintenance` integer NOT NULL,
	`communication` integer NOT NULL,
	`deposit` integer NOT NULL,
	`again` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`year` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_landlord_status` ON `reviews` (`landlord_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reviews_session_landlord` ON `reviews` (`session`,`landlord_id`);--> statement-breakpoint
CREATE INDEX `idx_reviews_session_created` ON `reviews` (`session`,`created_at`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_submissions_session_created` ON `submissions` (`session`,`created_at`);