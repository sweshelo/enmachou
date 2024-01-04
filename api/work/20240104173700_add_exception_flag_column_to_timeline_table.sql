use ccj;
ALTER TABLE timeline ADD exception varchar(50) DEFAULT NULL;
UPDATE timeline SET exception = 'RANK_GAUGE_AS_POINTS' where created_at > '2024-01-01 00:00:00';