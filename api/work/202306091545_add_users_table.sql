use ccj

CREATE TABLE users (
  user_id VARCHAR(32) UNIQUE NOT NULL,
  player_id INT NOT NULL,
  token VARCHAR(60) DEFAULT NULL,
  passhash VARCHAR(60) NOT NULL,
  is_hide_date BOOLEAN DEFAULT FALSE,
  is_hide_time BOOLEAN DEFAULT TRUE,
  online_threshold INT DEFAULT 20,
  is_authorized BOOLEAN DEFAULT FALSE,
  activation_code VARCHAR(8) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  authorized_at DATETIME DEFAULT NULL,
  permission INT DEFAULT 1,
  FOREIGN KEY (player_id)
  REFERENCES players(player_id)
);
