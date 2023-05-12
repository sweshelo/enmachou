import { combineReducers } from 'redux';
import accountReducer from './account/reducer.ts';

const rootReducer = combineReducers({
  accountReducer,
})

export default rootReducer
