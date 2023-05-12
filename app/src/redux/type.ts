type Player = {
  ranking: number;
  player_name: string;
  point: number;
  chara: string;
};

type PlayerDetail = Player & {
  achievement: string;
  online: boolean;
  log: PlayLog[];
  prefectures: string[];
};

type PlayLog = {
  timeline_id: number;
  player_name: string;
  ranking: number;
  achievement: string;
  chara: string;
  point: number;
  created_at: string;
  diff: number;
  last_timeline_id: number;
  elapsed: number;
}

export { Player, PlayerDetail, PlayLog }
