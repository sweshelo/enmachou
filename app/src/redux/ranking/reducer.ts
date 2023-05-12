import actions from './actions.ts'
import { Player } from '../type'

type Action = {
  type: string;
  payload: any;
}

type State = {
  normal: Player[];
  max: Player[];
}

const initialState: State = {
  normal: [],
  max: [],
}

const rankingReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_RANKING:
      return { ...state, normal: action.payload }
    case actions.SET_MAX_RANKING:
      return { ...state, max: action.payload}
    default:
      return { ...state }
  }
}

export default rankingReducer
