import { all, call } from 'redux-saga/effects';
import accountSaga from './account/saga.ts';

export default function* rootSaga(){
  yield all([
    call(accountSaga),
  ])
}
