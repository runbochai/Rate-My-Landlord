CREATE TABLE `buildings` (
	`id` text PRIMARY KEY NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_buildings_address` ON `buildings` (`address`,`city`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`building_id` text NOT NULL,
	`unit` text NOT NULL,
	`landlord_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landlord_id`) REFERENCES `landlords`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_listings_building_unit` ON `listings` (`building_id`,`unit`);--> statement-breakpoint
ALTER TABLE `reviews` ADD `listing_id` text;