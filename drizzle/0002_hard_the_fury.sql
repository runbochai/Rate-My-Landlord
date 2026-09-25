DROP INDEX `idx_reviews_session_landlord`;--> statement-breakpoint
ALTER TABLE `reviews` ADD `scope` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reviews_session_landlord_scope` ON `reviews` (`session`,`landlord_id`,`scope`);