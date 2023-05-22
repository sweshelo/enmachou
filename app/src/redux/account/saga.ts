import { all, call, takeEvery } from 'redux-saga/effects';
import actions from './actions.ts';

export function* tryLogin(){
}

export default function* accountSaga(){
  yield all([
    takeEvery(actions.TRY_LOGIN, tryLogin)
  ])
}
