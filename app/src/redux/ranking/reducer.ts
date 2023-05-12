import actions from './actions.ts'
import { Player } from '../type'

type Action = {
  type: string;
  payload: any;
}

type State = {
  player: Player[];
}

const initialState: State = {
  player: [],
}

const rankingReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_RANKING:
      return { ...state, player: action.payload }
    default:
      return { ...state }
  }
}

export default rankingReducer
