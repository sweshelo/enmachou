import { all, call, put, takeEvery, select } from 'redux-saga/effects';
import {EnmaApi} from '../helper/apiCall.ts';
import rootReducer from '../reducer';
import actions from './actions.ts';

const getAccount = (state: ReturnType<typeof rootReducer>) => state.accountReducer

export function* MiAuth({payload}): Generator<unknown, void, any>{
  try{
    const response = yield call(EnmaApi.verifyMisskeyAccount, payload.origin, payload.session)
    const result = yield response.json()
    if (result.status === 'error') throw Error(result.message)
    yield put(actions.setAuthorize({token: result.token, suggestPlayers: result.suggestPlayers, user: result.user}))
  }catch(e){
    alert(e.message)
    console.error(e)
  }
}

function* LinkPlayer({payload}): Generator<unknown, void, any>{
  try{
    const { token } = yield select(getAccount)
    const response = yield call(EnmaApi.LinkPlayerData, {
      playerName: payload.playerName,
      token,
    })
  }catch(e){
    console.error(e)
  }
}

function* changeSettings({payload}): Generator<unknown, void, any>{
  try{
    const { token } = yield select(getAccount)
    const response = yield call(EnmaApi.changeSettings, {
      ...payload,
      token,
    })
    yield put(actions.setSettings(response.body))
  }catch(e){
    console.error(e)
  }
}

export default function* accountSaga(){
  yield all([
    takeEvery(actions.MIAUTH, MiAuth),
    takeEvery(actions.LINK_PLAYER, LinkPlayer),
    takeEvery(actions.CHANGE_SETTINGS, changeSettings),
  ])
}
