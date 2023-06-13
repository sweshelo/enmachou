USE ccj;
ALTER TABLE users RENAME TO players;
ALTER TABLE players CHANGE user_id player_id INT;
ALTER TABLE players CHANGE user_name player_name VARCHAR(8);
ALTER TABLE timeline CHANGE user_name player_name VARCHAR(8);
