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

CREATE TABLE IF NOT EXISTS `ccj`.`users` (
  user_id VARCHAR(100) UNIQUE NOT NULL,
  player_id INT DEFAULT NULL,
  token VARCHAR(60) DEFAULT NULL,
  is_hide_date INT DEFAULT 0,
  is_hide_time INT DEFAULT -1, -- -1:非表示 / 0:表示 / 1:フォロワーのみ
  online_threshold INT DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  authorized_at DATETIME DEFAULT NULL,
  permission INT DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES players(player_id)
)

CREATE TABLE IF NOT EXISTS `ccj`.`ranking` (
  ranking_id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT DEFAULT NULL,
  player_name VARCHAR(8) NOT NULL,
  point INT NOT NULL,
  ranking INT NOT NULL,
  created_at DATETIME,
  record_date DATE,
  ranking_type VARCHAR(100),
  FOREIGN KEY (player_id) REFERENCES players(player_id)
)
