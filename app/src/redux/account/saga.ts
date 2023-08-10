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
    console.log(result, result.token, result.suggestPlayers)
    yield put(actions.setAuthorize({token: result.token, suggestPlayers: result.suggestPlayers}))
  }catch(e){
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
    console.log(response)
  }catch(e){
    console.error(e)
  }
}

export default function* accountSaga(){
  yield all([
    takeEvery(actions.MIAUTH, MiAuth),
    takeEvery(actions.LINK_PLAYER, LinkPlayer)
  ])
}
