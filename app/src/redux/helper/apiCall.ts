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
  static getMaxRecordRankingData(){
    return EnmaApi.httpGet('max-ranking')
  }
  static getPlayerDetailData(player: Player){
    return EnmaApi.httpGet(`users/${player.player_name}`)
  }
  static getPlayerPrefecturesData(player: Player){
    return EnmaApi.httpGet(`users/${player.player_name}/prefectures`)
  }
  static getOnlinePlayerData(){
    return EnmaApi.httpGet(`online`)
  }
}

export { EnmaApi }
