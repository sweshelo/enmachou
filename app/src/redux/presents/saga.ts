import { all, call, put, takeEvery } from 'redux-saga/effects';
import { EnmaApi } from '../helper/apiCall.ts';
import actions from './actions.ts';

export function* getPresents(): Generator<unknown, void, any>{
  try{
    const response = yield call(EnmaApi.getPresentsData)
    const result = yield response.json()
    yield put(actions.setPresents(result.body))
  }catch(e){
    console.log(e)
  }
}

export default function* presentsSaga(): Generator<any, any, any>{
  yield all([
    takeEvery(actions.GET_PRESENTS, getPresents)
  ])
}
