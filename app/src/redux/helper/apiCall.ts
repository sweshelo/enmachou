import { config } from '../../config';
import {Player} from '../type';

const base = config.baseEndpoint + '/api'

class EnmaApi {
  static httpPost(uri: string){
    return fetch(`${base}/${uri}`, {
      method: 'POST',
      credentials: 'include'
    }).then(response => response)
  }
  static httpGet(uri: string){
    return fetch(`${base}/${uri}`, {
      method: 'GET',
      credentials: 'include'
    }).then(response => response)
  }
  static getRankingData(){
    return EnmaApi.httpGet('ranking')
  }
  static getMaxRankingData(){
    return EnmaApi.httpGet('max-ranking')
  }
  static getPlayerDetailData(playerName: string){
    return EnmaApi.httpGet(`players/${playerName}`)
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
}

export { EnmaApi }
