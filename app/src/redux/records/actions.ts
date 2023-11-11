import {Player, PlayerDetail, PlayLog, Stats} from "../type"

const actions = {
  GET_ONLINEPLAYER: 'GET_ONLINEPLAYER',
  SET_ONLINEPLAYER: 'SET_ONLINEPLAYER',
  SET_AS_LOADED: 'SET_AS_LOADED',
  SET_AS_LOADING: 'SET_AS_LOADING',
  GET_RANKING: 'GET_RANKING',
  SET_RANKING: 'SET_RANKING',
  GET_MAX_RANKING: 'GET_MAX_RANKING',
  SET_MAX_RANKING: 'SET_MAX_RANKING',
  GET_PLAYER_DETAIL: 'GET_PLAYER_DETAIL',
  SET_PLAYER_DETAIL: 'SET_PLAYER_DETAIL',
  GET_STATS: 'GET_STATS',
  SET_STATS: 'SET_STATS',
  GET_MATCHING: 'GET_MATCHING',
  SET_MATCHING: 'SET_MATCHING',
  GET_AVERAGE_RANKING: 'GET_AVERAGE_RANKING',
  SET_AVERAGE_RANKING: 'SET_AVERAGE_RANKING',

  getRankingPlayerList: () => ({
    type: actions.GET_RANKING
  }),
  setRankingPlayerList: (payload: Player[]) => ({
    type: actions.SET_RANKING,
    payload,
  }),
  getMaxRankingPlayerList: () => ({
    type: actions.GET_MAX_RANKING
  }),
  setMaxRankingPlayerList: (payload: Player[]) => ({
    type: actions.SET_MAX_RANKING,
    payload,
  }),
  getAverageRankingPlayerList: () => ({
    type: actions.GET_AVERAGE_RANKING
  }),
  setAverageRankingPlayerList: (payload: Player[]) => ({
    type: actions.SET_AVERAGE_RANKING,
    payload
  }),
  getOnlinePlayerList: () => ({
    type: actions.GET_ONLINEPLAYER,
  }),
  setOnlinePlayerList: (payload: Player[]) => ({
    type: actions.SET_ONLINEPLAYER,
    payload,
  }),
  startLoading: () => ({
    type: actions.SET_AS_LOADING
  }),
  finishLoading: () => ({
    type: actions.SET_AS_LOADED
  }),
  getPlayerDetail: (playerName: string, limit?: number) => ({
    type: actions.GET_PLAYER_DETAIL,
    payload: {
      playerName,
      limit,
    }
  }),
  setPlayerDetail: (payload: PlayerDetail) => ({
    type: actions.SET_PLAYER_DETAIL,
    payload,
  }),
  getStats: () => ({
    type: actions.GET_STATS,
  }),
  setStats: (payload: Stats) => ({
    type: actions.SET_STATS,
    payload
  }),
  getMatching: (timelineId: Pick<PlayLog, 'timeline_id'>) => ({
    type: actions.GET_MATCHING,
    payload: {
      timelineId
    }
  }),
  setMatching: (payload: any) => ({
    type: actions.SET_MATCHING,
    payload
  })
}

export default actions
