import { combineReducers } from 'redux';
import accountReducer from './account/reducer.ts';
import recordsReducer from './records/reducer.ts';

const rootReducer = combineReducers({
  accountReducer,
  recordsReducer,
})

export default rootReducer
