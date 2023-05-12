import { all, call, put, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import actions from './actions.ts';

export function* getOnlineUser(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getOnlinePlayerData)
  const result = yield response.json()
  yield put(actions.setOnlineUserList(result))
  yield put(actions.finishLoading())
}

export default function* onlineSaga(){
  yield all([
    takeEvery(actions.GET_ONLINEUSER, getOnlineUser)
  ])
}
