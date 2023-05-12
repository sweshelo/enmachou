import { combineReducers } from 'redux';
import accountReducer from './account/reducer.ts';
import onlineReducer from './online/reducer.ts';

const rootReducer = combineReducers({
  accountReducer,
  onlineReducer,
})

export default rootReducer
