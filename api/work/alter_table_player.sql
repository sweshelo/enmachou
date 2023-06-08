use ccj

-- 平均値を格納するカラムを追加
ALTER TABLE players
ADD COLUMN average DECIMAL(10, 2) DEFAULT 0.00;

-- 有効平均値を格納するカラムを追加
ALTER TABLE players
ADD COLUMN effective_average DECIMAL(10, 2) DEFAULT 0.00;

-- 偏差値を格納するカラムを追加
ALTER TABLE players
ADD COLUMN deviation_value DECIMAL(10, 2) DEFAULT 0.00;

-- 利用ユーザの紐付け
ALTER TABLE players
ADD COLUMN user_id VARCHAR(32) DEFAULT NULL;
