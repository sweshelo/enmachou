CREATE TABLE IF NOT EXISTS `ccj`.`players` (
  `player_id` INT PRIMARY KEY AUTO_INCREMENT,
  `player_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `rank_diff` INT DEFAULT NULL,
  `point_diff` INT DEFAULT NULL,
  `average` DECIMAL(10, 2) DEFAULT 0.00,
  `effective_average` DECIMAL(10, 2) DEFAULT 0.00,
  `deviation_value` DECIMAL(10, 2) DEFAULT 0.00,
  `user_id` VARCHAR(32) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `ccj`.`timeline` (
  `timeline_id` INT PRIMARY KEY AUTO_INCREMENT,
  `player_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `diff` INT DEFAULT NULL,
  `last_timeline_id` INT DEFAULT NULL,
  `elapsed` INT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `ccj`.`log` (
  `log_id` INT PRIMARY KEY AUTO_INCREMENT,
  `tracker` VARCHAR(36),
  `visit` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ccj`.`presents` (
  `original_name` TEXT,
  `identify_name` TEXT,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `count` INT,
  `remain` INT,
  `diff` INT,
);
