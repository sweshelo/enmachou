export type Timeline = {
  timeline_id: number
  player_name: string
  ranking: number
  achievement: string
  chara: string
  point: number
  created_at: string
  diff: number
  last_timeline_id: number
  elapsed: number
};

export type Players = {
  player_id: number
  player_name: string
  ranking: number
  achievement: string
  chara: string
  point: number
  point_diff: number
  average: number
  effective_average: number
  deviation_value: number
  user_id: string
  created_at: string
  updated_at: string
};

export type User = {
  user_id: string
  player_id: number
  token: string
  is_hide_date: boolean
  is_hide_time: boolean
  online_threshold: number
  is_authorized: boolean
}
