import { combineReducers } from 'redux';
import accountReducer from './account/reducer.ts';
import onlineReducer from './online/reducer.ts';
import rankingReducer from './ranking/reducer.ts';

const rootReducer = combineReducers({
  accountReducer,
  onlineReducer,
  rankingReducer,
})

export default rootReducer
