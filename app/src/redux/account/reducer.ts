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
    hideDateTime: boolean;
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
      return { ...state, token: action.payload.token, suggestPlayers: action.payload.suggestPlayers }
    case actions.TEST:
      return { ...state }
    default:
      return { ...state }
  }
}

export default accountReducer
