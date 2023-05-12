import {Player} from "../type"

const actions = {
  GET_RANKING: 'GET_RANKING',
  SET_RANKING: 'SET_RANKING',
  GET_MAX_RANKING: 'GET_MAX_RANKING',
  SET_MAX_RANKING: 'SET_MAX_RANKING',
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
  })
}

export default actions
