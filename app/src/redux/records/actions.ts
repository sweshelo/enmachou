import {Player, PlayerDetail, PlayLog, Stats} from "../type"

const actions = {
  GET_ONLINEUSER: 'GET_ONLINEUSER',
  SET_ONLINEUSER: 'SET_ONLINEUSER',
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

  getRankingUserList: () => ({
    type: actions.GET_RANKING
  }),
  setRankingUserList: (payload: Player[]) => ({
    type: actions.SET_RANKING,
    payload,
  }),
  getMaxRankingUserList: () => ({
    type: actions.GET_MAX_RANKING
  }),
  setMaxRankingUserList: (payload: Player[]) => ({
    type: actions.SET_MAX_RANKING,
    payload,
  }),
  getOnlineUserList: () => ({
    type: actions.GET_ONLINEUSER
  }),
  setOnlineUserList: (payload: Player[]) => ({
    type: actions.SET_ONLINEUSER,
    payload,
  }),
  startLoading: () => ({
    type: actions.SET_AS_LOADING
  }),
  finishLoading: () => ({
    type: actions.SET_AS_LOADED
  }),
  getPlayerDetail: (playerName: string) => ({
    type: actions.GET_PLAYER_DETAIL,
    payload: {
      playerName
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
}

export default actions
