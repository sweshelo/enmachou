import actions from "./actions.ts";
import { PresentsItem, PresentsItemHistory } from "../type";

type State = {
  items: Array<PresentsItem>
}

type Action = {
  type: string,
  payload: any
}

const initialState: State = {
  items: []
}

const presentsReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.SET_PRESENTS:
      return { ...state, items: action.payload }
    default:
      return state
  }
}

export default presentsReducer
