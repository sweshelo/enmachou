CREATE TABLE IF NOT EXISTS `ccj`.`users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `rank_diff` INT DEFAULT NULL,
  `point_diff` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `ccj`.`timeline` (
  `timeline_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `diff` INT DEFAULT NULL,
  `last_timeline_id` INT DEFAULT NULL,
  `elapsed` INT DEFAULT NULL
);
