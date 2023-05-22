import actions from './actions.ts'

type Action = {
  type: string;
  payload: any;
}

type State = {
  tracker: string;
  token: string;
}

const initialState: State = {
  tracker: '',
  token: ''
}

const accountReducer = (state = initialState, action: Action) => {
  switch(action.type){
    case actions.DONE_LOGIN:
      return { ...action.payload }
    case actions.TEST:
      console.log('hello.')
      return { ...state }
    default:
      return { ...state }
  }
}

export default accountReducer
