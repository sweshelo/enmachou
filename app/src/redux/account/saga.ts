import { all, call, put, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import actions from './actions.ts';

export function* MiAuth({payload}): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.verifyMisskeyAccount, payload.origin, payload.session)
  const result = yield response.json()
  yield put(actions.setToken(result.token))
}

export default function* accountSaga(){
  yield all([
    takeEvery(actions.MIAUTH, MiAuth)
  ])
}
