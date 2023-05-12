import {Player} from "../type"

const actions = {
  GET_ONLINEUSER: 'GET_ONLINEUSER',
  SET_ONLINEUSER: 'SET_ONLINEUSER',
  SET_AS_LOADED: 'SET_AS_LOADED',
  SET_AS_LOADING: 'SET_AS_LOADING',
  getOnlineUserList: () => ({
    type: actions.GET_ONLINEUSER
  }),
  setOnlineUserList: (payload: Player[])=>{
    return({
      type: 'SET_ONLINEUSER',
      payload,
    })
  },
  startLoading: () => ({
    type: actions.SET_AS_LOADING
  }),
  finishLoading: () => ({
    type: actions.SET_AS_LOADED
  }),
}

export default actions
