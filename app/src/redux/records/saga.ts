import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import rootReducer from '../reducer';
import actions from './actions.ts';

const getAccount = (state: ReturnType<typeof rootReducer>) => state.accountReducer

export function* getOnlinePlayer(): Generator<unknown, void, any>{
  const { token } = yield select(getAccount)
  const response = yield call(EnmaApi.getOnlinePlayerData, token)
  const result = yield response.json()
  if (result.status === 'error') {
    alert(result.message)
  }
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

export function* getAverageRankingData(): Generator<unknown, void, any>{
  const { token } = yield select(getAccount)
  const response = yield call(EnmaApi.getAverageRankingData, token)
  const result = yield response.json()
  yield put(actions.setAverageRankingPlayerList(result.body))
}

export function* getPlayerDetailData({payload}): Generator<unknown, void, any>{
  const { token } = yield select(getAccount)
  const response = yield call(EnmaApi.getPlayerDetailData, {...payload, token})
  const result = yield response.json()
  yield put(actions.setPlayerDetail(result.body))
}

export function* getStatsData(): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getStatsData)
  const result = yield response.json()
  yield put(actions.setStats(result.body))
}

export function* getMatchingData({payload}): Generator<unknown, void, any>{
  const response = yield call(EnmaApi.getMatchingData, payload.timelineId)
  const result = yield response.json()
  yield put(actions.setMatching(result.body))
}

function* getGaugeRanking(): Generator<unknown, void, any>{
  const { token } = yield select(getAccount)
  const response = yield call(EnmaApi.getGuageRanking, {token})
  const result = yield response.json()
  yield put(actions.setGaugeRanking(result.body))
}

export default function* recordsSaga(): Generator<any, any, any>{
  yield all([
    takeEvery(actions.GET_RANKING, getRankingData),
    takeEvery(actions.GET_MAX_RANKING, getMaxRankingData),
    takeEvery(actions.GET_AVERAGE_RANKING, getAverageRankingData),
    takeEvery(actions.GET_ONLINEPLAYER, getOnlinePlayer),
    takeEvery(actions.GET_PLAYER_DETAIL, getPlayerDetailData),
    takeEvery(actions.GET_STATS, getStatsData),
    takeEvery(actions.GET_MATCHING, getMatchingData),
    takeEvery(actions.GET_GAUGE_RANKING, getGaugeRanking),
  ])
}
