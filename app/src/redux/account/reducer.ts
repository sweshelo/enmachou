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
}

const initialState: State = {
  tracker: '',
  token: '',
  isLoggedIn: false,
  user: null
}

const accountReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.DONE_LOGIN:
      return { ...action.payload }
    case actions.TEST:
      return { ...state }
    default:
      return { ...state }
  }
}

export default accountReducer
