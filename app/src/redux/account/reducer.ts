import {Player} from '../type';
import actions from './actions.ts'

type Action = {
  type: string;
  payload: any;
}

type State = {
  tracker: string;
  token: string;
  isLoggedIn: boolean;
  user: {
    playerName: string;
    userId: string;
    isHiddenDate: number;
    isHiddenTime: number;
  } | undefined | null
  suggestPlayers: Player[] | undefined | null
}

const initialState: State = {
  tracker: '',
  token: '',
  isLoggedIn: false,
  user: null,
  suggestPlayers: null
}

const accountReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_AUTHORIZE:
      return { ...state, token: action.payload.token, suggestPlayers: action.payload.suggestPlayers, user: action.payload.user }
    case actions.LOGOUT:
      return { ...state, token: '', user: null }
    case actions.SET_SETTINGS:
      return { ...state, user: {...state.user, isHiddenDate: action.payload.isHiddenDate, isHiddenTime: action.payload.isHiddenTime}}
    default:
      return { ...state }
  }
}

export default accountReducer
