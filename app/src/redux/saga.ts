import { all, call } from 'redux-saga/effects';
import accountSaga from './account/saga.ts';
import presentsSaga from './presents/saga.ts';
import recordsSaga from './records/saga.ts';

export default function* rootSaga(){
  yield all([
    call(accountSaga),
    call(recordsSaga),
    call(presentsSaga),
  ])
}
