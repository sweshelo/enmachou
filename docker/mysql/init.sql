CREATE TABLE IF NOT EXISTS `ccj`.`users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `rank_diff` INT DEFAULT NULL,
  `point_diff` INT DEFAULT NULL,
  `create_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ccj`.`timeline` (
  `timeline_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(8) NOT NULL,
  `ranking` INT,
  `achievement` TEXT,
  `chara` TEXT,
  `point` INT,
  `create_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);
