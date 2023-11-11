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
