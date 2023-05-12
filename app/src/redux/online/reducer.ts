import actions from './actions.ts'
import { Player } from '../type'

type Action = {
  type: string;
  payload: any;
}

type State = {
  player: Player[];
  isLoading: boolean;
}

const initialState: State = {
  player: [],
  isLoading: true,
}

const onlineReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_ONLINEUSER:
      return { ...state, player: action.payload }
    case actions.SET_AS_LOADING:
      return { ...state, isLoading: true }
    case actions.SET_AS_LOADED:
      return { ...state, isLoading: false }
    default:
      return { ...state }
  }
}

export default onlineReducer
