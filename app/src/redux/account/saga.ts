import { all, call, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import actions from './actions.ts';

function* MiAuth({payload}){
  const response = yield call(EnmaApi.verifyMisskeyAccount(payload.origin, payload.session))
  const result = yield response.json()
  console.log(result)
}

export default function* accountSaga(){
  yield all([
    takeEvery(actions.MIAUTH, MiAuth)
  ])
}
