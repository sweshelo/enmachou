import actions from './actions.ts'
import { Player, PlayerDetail, Stats } from '../type'

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
  stats: Stats | null;
}

const initialState: State = {
  onlinePlayer: [],
  standardRanking: [],
  maxRanking: [],
  isLoading: true,
  playerDetail: null,
  stats: null,
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
    case actions.SET_STATS:
      return { ...state, stats: action.payload }
    default:
      return { ...state }
  }
}

export default recordsReducer
