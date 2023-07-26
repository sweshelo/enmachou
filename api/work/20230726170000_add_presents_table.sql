use ccj
CREATE TABLE presents(
  `original_name` TEXT,
  `identify_name` TEXT,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `count` INT,
  `remain` INT,
  `diff` INT
)
