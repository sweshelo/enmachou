import { all, call, put, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import actions from './actions.ts';

export function* getRankingData(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getRankingData)
  const result = yield response.json()
  yield put(actions.setRankingUserList(result))
}

export default function* rankingSaga(){
  yield all([
    takeEvery(actions.GET_RANKING, getRankingData)
  ])
}
