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

type Chara = {
  name: string;
  count: number;
  color: string;
}

type Stats = {
  data: {
    [key: string]: {
      records: number;
      play: {
        [key: string]: Chara
      };
      ranking: {
        [key: string]: Chara
      };
    }
  };
  dateKeys: string[];
}

export { Player, PlayerDetail, PlayLog, Stats }
