import { all, call, put, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import actions from './actions.ts';

export function* getOnlinePlayer(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getOnlinePlayerData)
  const result = yield response.json()
  yield put(actions.setOnlinePlayerList(result.body))
  yield put(actions.finishLoading())
}

export function* getRankingData(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getRankingData)
  const result = yield response.json()
  yield put(actions.setRankingPlayerList(result.body))
}

export function* getMaxRankingData(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getMaxRankingData)
  const result = yield response.json()
  yield put(actions.setMaxRankingPlayerList(result.body))
}

export function* getPlayerDetailData({payload}): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getPlayerDetailData, payload.playerName)
  const result = yield response.json()
  yield put(actions.setPlayerDetail(result.body))
}

export function* getStatsData(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getStatsData)
  const result = yield response.json()
  yield put(actions.setStats(result.body))
}

export default function* recordsSaga(): Generator<any, any, any>{
  yield all([
    takeEvery(actions.GET_RANKING, getRankingData),
    takeEvery(actions.GET_MAX_RANKING, getMaxRankingData),
    takeEvery(actions.GET_ONLINEPLAYER, getOnlinePlayer),
    takeEvery(actions.GET_PLAYER_DETAIL, getPlayerDetailData),
    takeEvery(actions.GET_STATS, getStatsData),
  ])
}
