import { combineReducers } from 'redux';
import accountReducer from './account/reducer.ts';
import recordsReducer from './records/reducer.ts';
import presentsReducer from './presents/reducer.ts';

const rootReducer = combineReducers({
  accountReducer,
  recordsReducer,
  presentsReducer,
})

export default rootReducer
