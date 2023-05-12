import {Player} from "../type"

const actions = {
  GET_RANKING: 'GET_RANKING',
  SET_RANKING: 'SET_RANKING',
  getRankingUserList: () => ({
    type: actions.GET_RANKING
  }),
  setRankingUserList: (payload: Player[])=>{
    return({
      type: actions.SET_RANKING,
      payload,
    })
  },
}

export default actions
