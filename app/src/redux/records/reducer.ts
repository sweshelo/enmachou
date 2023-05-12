import actions from './actions.ts'
import { Player, PlayerDetail } from '../type'

type Action = {
  type: string;
  payload: any;
}

type State = {
  onlinePlayer: Player[];
  standardRanking: Player[];
  maxRanking: Player[];
  isLoading: boolean;
  playerDetail: PlayerDetail | null;
}

const initialState: State = {
  onlinePlayer: [],
  standardRanking: [],
  maxRanking: [],
  isLoading: true,
  playerDetail: null,
}

const recordsReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_ONLINEUSER:
      return { ...state, onlinePlayer: action.payload }
    case actions.SET_AS_LOADING:
      return { ...state, isLoading: true }
    case actions.SET_AS_LOADED:
      return { ...state, isLoading: false }
    case actions.SET_RANKING:
      return { ...state, standardRanking: action.payload }
    case actions.SET_MAX_RANKING:
      return { ...state, maxRanking: action.payload }
    case actions.SET_PLAYER_DETAIL:
      return { ...state, playerDetail: action.payload }
    default:
      return { ...state }
  }
}

export default recordsReducer
