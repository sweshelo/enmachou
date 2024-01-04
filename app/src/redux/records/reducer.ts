import actions from './actions.ts'
import { Player, PlayerDetail, PlayLog, Stats } from '../type'

type Action = {
  type: string;
  payload: any;
}

type PlayerGuage = {
  playername: string
  guage: number
}

type State = {
  onlinePlayer: Player[];
  standardRanking: Player[];
  maxRanking: Player[];
  AverageRanking: Player[];
  matching: {
    id: string,
    record: PlayLog[]
  } | null;
  isLoading: boolean;
  playerDetails: {
    [key: string]: PlayerDetail | null
  } | null;
  stats: Stats | null;
  currentStage: string;
  guageRanking: {
    top: number,
    border: number,
    players: PlayerGuage[],
  }
}

const initialState: State = {
  onlinePlayer: [],
  standardRanking: [],
  maxRanking: [],
  AverageRanking: [],
  matching: null,
  isLoading: true,
  playerDetails: {},
  stats: null,
  currentStage: '',
  guageRanking: {
    top: -1,
    border: -1,
    players: [],
  }
}

const recordsReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_ONLINEPLAYER:
      return { ...state, onlinePlayer: action.payload.players, currentStage: action.payload.stage }
    case actions.SET_AS_LOADING:
      return { ...state, isLoading: true }
    case actions.SET_AS_LOADED:
      return { ...state, isLoading: false }
    case actions.SET_RANKING:
      return { ...state, standardRanking: action.payload }
    case actions.SET_MAX_RANKING:
      return { ...state, maxRanking: action.payload }
    case actions.SET_AVERAGE_RANKING:
      return { ...state, AverageRanking: action.payload }
    case actions.SET_PLAYER_DETAIL:
      if (!action.payload) return {...state}
      return {
        ...state,
        playerDetails: {
          ...state.playerDetails,
          [action.payload.player_name]: action.payload
        }
      }
    case actions.SET_STATS:
      return { ...state, stats: action.payload }
    case actions.SET_MATCHING:
      return { ...state, matching: action.payload }
    case actions.SET_GAUGE_RANKING:
      return { ...state, gaugeRanking: action.payload }
    default:
      return { ...state }
  }
}

export default recordsReducer
