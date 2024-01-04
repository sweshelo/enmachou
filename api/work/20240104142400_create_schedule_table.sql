CREATE TABLE IF NOT EXISTS `ccj`.`schedule` (
  schedule_id INT PRIMARY KEY AUTO_INCREMENT,
  created_at DATETIME,
  updated_at DATETIME,
  started_at DATETIME,
  ended_at DATETIME,
  odd_stage VARCHAR(50),
  even_stage VARCHAR(50),
  user_id VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)
