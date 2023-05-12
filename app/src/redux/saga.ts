import { all, call } from 'redux-saga/effects';
import accountSaga from './account/saga.ts';
import onlineSaga from './online/saga.ts';
import rankingSaga from './ranking/saga.ts';

export default function* rootSaga(){
  yield all([
    call(accountSaga),
    call(onlineSaga),
    call(rankingSaga),
  ])
}
