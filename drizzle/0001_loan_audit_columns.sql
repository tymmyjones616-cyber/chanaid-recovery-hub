ALTER TABLE `loan_applications` ADD `submitted_at` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `ip_address` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `user_agent` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `verified_at` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `verified_by` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `reviewed_at` text;
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `status_history` text DEFAULT '[]';
--> statement-breakpoint
ALTER TABLE `loan_applications` ADD `submission_complete` integer DEFAULT true;
