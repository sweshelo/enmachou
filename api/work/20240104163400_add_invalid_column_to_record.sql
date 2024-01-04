use ccj;
ALTER TABLE timeline ADD invalid BOOLEAN DEFAULT FALSE;

CREATE TABLE moderation (
  moderation_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  operation TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)