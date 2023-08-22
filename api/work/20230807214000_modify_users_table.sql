use ccj
DROP TABLE users;
CREATE TABLE users (
  user_id VARCHAR(100) UNIQUE NOT NULL,
  player_id INT DEFAULT NULL,
  token VARCHAR(60) DEFAULT NULL,
  is_hide_date INT DEFAULT 0,
  is_hide_time INT DEFAULT -1, -- -1:非表示 / 0:表示 / 1:フォロワーのみ
  online_threshold INT DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  authorized_at DATETIME DEFAULT NULL,
  permission INT DEFAULT 1,
  FOREIGN KEY (player_id)
  REFERENCES players(player_id)
);
