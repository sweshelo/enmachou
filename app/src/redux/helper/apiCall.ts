import { config } from '../../config';
import {Player} from '../type';

const base = config.baseEndpoint + '/api'

class EnmaApi {
  static httpPost(uri: string, body: any, token: string | undefined = undefined){
    return fetch(`${base}/${uri}`, {
      method: 'POST',
      credentials: 'include',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': token ?? '',
      },
      body: JSON.stringify(body),
    }).then(response => response)
  }
  static httpGet(uri: string, token: string | undefined = undefined){
    return fetch(`${base}/${uri}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': token ?? ''
      }
    }).then(response => response)
  }
  static getRankingData(){
    return EnmaApi.httpGet('ranking')
  }
  static getMaxRankingData(){
    return EnmaApi.httpGet('max-ranking')
  }
  static getAverageRankingData(){
    return EnmaApi.httpGet('average-ranking')
  }
  static getPlayerDetailData(payload: {playerName: string, token: string}){
    return EnmaApi.httpGet(`players/${payload.playerName}`, payload.token)
  }
  static getPlayerPrefecturesData(playerName: string){
    return EnmaApi.httpGet(`players/${playerName}/prefectures`)
  }
  static getOnlinePlayerData(){
    return EnmaApi.httpGet(`online`)
  }
  static getStatsData(){
    return EnmaApi.httpGet(`stats`)
  }
  static getMatchingData(timelineId: string){
    return EnmaApi.httpGet(`matching/${timelineId}`)
  }
  static verifyMisskeyAccount(origin: string, session: string){
    return EnmaApi.httpPost(`miauth`, {
      origin, session
    })
  }
  static getPresentsData(){
    return EnmaApi.httpGet(`presents`)
  }
  static LinkPlayerData(payload: {playerName: string, token: string}){
    console.log(payload.token)
    return EnmaApi.httpPost(`link-player`,
      {
        playerName: payload.playerName
      },
      payload.token
    )
  }
}

export { EnmaApi }
