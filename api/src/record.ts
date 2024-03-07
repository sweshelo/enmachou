import {createConnection, Connection} from 'mysql2/promise'
import Logger from './logging'
import {Request, Response} from 'express'
import { datetimeToTimeframe, identifyStage, toFullWidth } from './helper'
import {Timeline, Players, User} from './types/table'
import {OnlineRequestBody} from './types/request'
import {isNull} from 'util'
import fs from 'fs'
import * as jwt from 'jsonwebtoken';

const status = {
  ok: 'ok',
  error: 'error',
  undefined: 'undefind'
}

class Record {
  connection: Promise<Connection>;
  defaultOnlineThreshold: number = 20;
  private privateKey: string;
  private publicKey: string;

  constructor(connection: Promise<Connection>){
    this.connection = connection
    this.privateKey = fs.readFileSync('signkey.pem').toString()
    this.publicKey = fs.readFileSync('publickey.pem').toString()
  }

  async getRanking(req: Request, res: Response){
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const getLatestRankingFromTimelineQuery = "SELECT ranking, player_name, point, chara FROM (SELECT * FROM ranking ORDER BY created_at DESC LIMIT 100) AS t ORDER BY ranking;"
      const [ result ] = await (await this.connection).execute(getLatestRankingFromTimelineQuery)
      if (result && Array.isArray(result) && result.length > 0){
        res.send({
          status: status.ok,
          body: result
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
      return
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getPlayerinfo(req: Request, res: Response){
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const decodedToken = req.headers.authorization ? jwt.verify(req.headers.authorization, this.publicKey) : null
      const authorizedUserId = decodedToken ? decodedToken['user'] : null
      const limit = req.query.limit ? Number(req.query.limit) : 300

      // ユーザ認証
      const getUserAccountFromUsersQuery = "SELECT * FROM users WHERE user_id = ? LIMIT 1;"
      const [ userAccountResult ] = await (await this.connection).execute(getUserAccountFromUsersQuery, [ authorizedUserId || ''])
      const userAccount = (userAccountResult as User[]).length > 0 ? userAccountResult[0] as User : null
      const isGettingSelfData = userAccount?.user_id === authorizedUserId
      const isModerator = userAccount?.permission > 1
      const isLoggedIn = authorizedUserId ? true : false

      if( toFullWidth(req.params.playername) === 'プレーヤー' ){
        const response = {
          'isModerator': isModerator,
          'player_name': toFullWidth(req.params.playername),
          'achievement': '',
          'chara': null,
          'point': 0,
          'ranking': 0,
          'online': false,
          'average': null,
          'effective_average': 0.00,
          'diviation_value': 0.00,
          'diff': [],
          'log': [],
        }
        res.send({
          status: status.error,
          message: 'このユーザのデータを取得することは出来ません。',
          body: response
        })
        return
      }

      const getUserTimelineFromTimelineQuery = `SELECT * FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー' AND diff > 0 AND exception is null ORDER BY created_at DESC LIMIT ?;`
      const getUserTimelineFromTilelineForRankGaugeQuery = `SELECT * FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー' AND diff > 0 AND exception = 'RANK_GAUGE_AS_POINTS' ORDER BY created_at DESC;`
      const getUserAchievementFromTimelineQuery = "SELECT DISTINCT achievement FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー';"
      const [ [playLogQueryResult], [prefectureQueryResult], [playLogForRankGaugeResult] ] = await Promise.all([
        (await this.connection).execute(getUserTimelineFromTimelineQuery, [ toFullWidth(req.params.playername), limit ]),
        (await this.connection).execute(getUserAchievementFromTimelineQuery, [ toFullWidth(req.params.playername) ]),
        (await this.connection).execute(getUserTimelineFromTilelineForRankGaugeQuery, [ toFullWidth(req.params.playername) ]),
      ])

      const playLogResult = playLogQueryResult as Timeline[]
      const prefectureResult = prefectureQueryResult as Pick<Timeline, 'achievement'>[]

      if((playLogResult as Timeline[]).length > 0){
        // 制県度
        const prefectureAchievementTable = [
          { name: '北海道', achievement: 'North Sea Road' },
          { name: '青森県', achievement: 'Blue Forest' },
          { name: '岩手県', achievement: 'Rock Hand' },
          { name: '宮城県', achievement: 'Palace Castle' },
          { name: '秋田県', achievement: 'Autumn Paddy' },
          { name: '山形県', achievement: 'Mountain Form' },
          { name: '福島県', achievement: 'Happy Island' },
          { name: '茨城県', achievement: 'Thorn Castle' },
          { name: '栃木県', achievement: 'Buckeye' },
          { name: '群馬県', achievement: 'Herd Horse' },
          { name: '埼玉県', achievement: 'Cape Ball' },
          { name: '千葉県', achievement: 'Thousand Leaf' },
          { name: '東京都', achievement: 'East Capital' },
          { name: '神奈川県', achievement: 'God Apple River' },
          { name: '新潟県', achievement: 'New Lagoon' },
          { name: '富山県', achievement: 'Mt. Wealth' },
          { name: '石川県', achievement: 'Stone River' },
          { name: '福井県', achievement: 'Happy Well' },
          { name: '山梨県', achievement: 'Mountain Pear' },
          { name: '長野県', achievement: 'Long Field' },
          { name: '岐阜県', achievement: 'Crossroads Hill' },
          { name: '静岡県', achievement: 'Silent Hill' },
          { name: '愛知県', achievement: 'Love Intelligence' },
          { name: '三重県', achievement: 'Triple' },
          { name: '滋賀県', achievement: 'Moisten Celebrate' },
          { name: '京都府', achievement: 'Capital' },
          { name: '大阪府', achievement: 'Big Slope' },
          { name: '兵庫県', achievement: 'Soldier Warehouse' },
          { name: '奈良県', achievement: 'Nice Apple' },
          { name: '和歌山県', achievement: 'Mt. Gentle Song' },
          { name: '鳥取県', achievement: 'Bird Get' },
          { name: '島根県', achievement: 'Island Root' },
          { name: '岡山県', achievement: 'Mt. Hill' },
          { name: '広島県', achievement: 'Wide Island' },
          { name: '山口県', achievement: 'Mountain Mouth' },
          { name: '徳島県', achievement: 'Virtue Island' },
          { name: '香川県', achievement: 'Aroma River' },
          { name: '愛媛県', achievement: 'Love Princess' },
          { name: '高知県', achievement: 'High Intelligence' },
          { name: '福岡県', achievement: 'Happy Hill' },
          { name: '佐賀県', achievement: 'Assistant Celebrate' },
          { name: '長崎県', achievement: 'Long Cape' },
          { name: '熊本県', achievement: 'Bear Book' },
          { name: '大分県', achievement: 'Big Minute' },
          { name: '宮崎県', achievement: 'Palace Cape' },
          { name: '鹿児島県', achievement: 'Fawn Island' },
          { name: '沖縄県', achievement: 'Offing Rope' },
        ]
        const achievementArray = prefectureResult.map(r => r.achievement)

        // 有効平均貢献度類
        const [ playerInfoResult ] = await (await this.connection).execute('SELECT * FROM players WHERE player_name = ?', [ toFullWidth(req.params.playername) ])
        const playerInfo = (playerInfoResult as Players[]).length > 0 ? playerInfoResult[0] as Players : null
        const shouldHideDate = isModerator ? false : !isGettingSelfData && (userAccount?.is_hide_date === -1)
        const shouldHideTime = isModerator ? false : userAccount ? !isGettingSelfData && (userAccount.is_hide_time === -1) : true

        // 増分を計算する
        const latestRecord = playLogResult[0]
        const response = {
          'player_name': toFullWidth(req.params.playername),
          'achievement': latestRecord.achievement,
          'chara': latestRecord.chara,
          'point': latestRecord.point,
          'ranking': latestRecord.ranking,
          'online': (new Date().getTime() - new Date(latestRecord.created_at).getTime()) <= this.defaultOnlineThreshold * 60 * 1000,
          'log': playLogResult.map((r) => ({
            ...r,
            datetime: shouldHideDate ? null : datetimeToTimeframe(r.updated_at ?? r.created_at, shouldHideTime),
            stage: shouldHideTime ? null : identifyStage(r.updated_at ?? r.created_at),
            updated_at: undefined,
            created_at: undefined,
          }),
          ),
          'rankgauge_log': isLoggedIn ? (playLogForRankGaugeResult as Timeline[]).map((r) => ({
            ...r,
            datetime: shouldHideDate ? null : datetimeToTimeframe(r.updated_at ?? r.created_at, shouldHideDate),
            stage: shouldHideTime ? null : identifyStage(r.updated_at ?? r.created_at),
            updated_at: undefined,
            created_at: undefined,
          })) : [],
          'prefectures': prefectureAchievementTable.map(p => achievementArray.includes(toFullWidth(p.achievement)) ? p.name : null).filter(n => n),
          'effective_average': playerInfo ? playerInfo.effective_average : null,
          'deviation_value': playerInfo ? playerInfo.deviation_value : null,
          'isPublicDetail': !(shouldHideDate || shouldHideTime),
          'isHiddenDate': shouldHideDate,
          'isHiddenTime': shouldHideTime,
          'isModerator': isModerator,
          'isGettingSelfData': isGettingSelfData,
        }

        res.send({
          status: status.ok,
          body: response
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getPrefectures(req: Request, res: Response){
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const getUserAchievementFromTimelineQuery = "SELECT DISTINCT achievement FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー';"
      const [ result ] = await (await this.connection).execute(getUserAchievementFromTimelineQuery, [ toFullWidth(req.params.username) ])
      const achievements = result as Pick<Timeline, 'achievement'>[]

      if(achievements.length > 0){
        const prefectureAchievementTable = [
          { name: '北海道', achievement: 'North Sea Road' },
          { name: '青森県', achievement: 'Blue Forest' },
          { name: '岩手県', achievement: 'Rock Hand' },
          { name: '宮城県', achievement: 'Palace Castle' },
          { name: '秋田県', achievement: 'Autumn Paddy' },
          { name: '山形県', achievement: 'Mountain Form' },
          { name: '福島県', achievement: 'Happy Island' },
          { name: '茨城県', achievement: 'Thorn Castle' },
          { name: '栃木県', achievement: 'Buckeye' },
          { name: '群馬県', achievement: 'Herd Horse' },
          { name: '埼玉県', achievement: 'Cape Ball' },
          { name: '千葉県', achievement: 'Thousand Leaf' },
          { name: '東京都', achievement: 'East Capital' },
          { name: '神奈川県', achievement: 'God Apple River' },
          { name: '新潟県', achievement: 'New Lagoon' },
          { name: '富山県', achievement: 'Mt. Wealth' },
          { name: '石川県', achievement: 'Stone River' },
          { name: '福井県', achievement: 'Happy Well' },
          { name: '山梨県', achievement: 'Mountain Pear' },
          { name: '長野県', achievement: 'Long Field' },
          { name: '岐阜県', achievement: 'Crossroads Hill' },
          { name: '静岡県', achievement: 'Silent Hill' },
          { name: '愛知県', achievement: 'Love Intelligence' },
          { name: '三重県', achievement: 'Triple' },
          { name: '滋賀県', achievement: 'Moisten Celebrate' },
          { name: '京都府', achievement: 'Capital' },
          { name: '大阪府', achievement: 'Big Slope' },
          { name: '兵庫県', achievement: 'Soldier Warehouse' },
          { name: '奈良県', achievement: 'Nice Apple' },
          { name: '和歌山県', achievement: 'Mt. Gentle Song' },
          { name: '鳥取県', achievement: 'Bird Get' },
          { name: '島根県', achievement: 'Island Root' },
          { name: '岡山県', achievement: 'Mt. Hill' },
          { name: '広島県', achievement: 'Wide Island' },
          { name: '山口県', achievement: 'Mountain Mouth' },
          { name: '徳島県', achievement: 'Virtue Island' },
          { name: '香川県', achievement: 'Aroma River' },
          { name: '愛媛県', achievement: 'Love Princess' },
          { name: '高知県', achievement: 'High Intelligence' },
          { name: '福岡県', achievement: 'Happy Hill' },
          { name: '佐賀県', achievement: 'Assistant Celebrate' },
          { name: '長崎県', achievement: 'Long Cape' },
          { name: '熊本県', achievement: 'Bear Book' },
          { name: '大分県', achievement: 'Big Minute' },
          { name: '宮崎県', achievement: 'Palace Cape' },
          { name: '鹿児島県', achievement: 'Fawn Island' },
          { name: '沖縄県', achievement: 'Offing Rope' },
        ]
        const achievementArray = achievements.map(r => r.achievement)
        res.send(prefectureAchievementTable.map(p => achievementArray.includes(toFullWidth(p.achievement)) ? p.name : null).filter(n => n))
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getOnlinePlayers(req: Request<OnlineRequestBody>, res: Response){
    type TimelineForOnlinePlayer = Pick<Timeline, 'player_name' | 'ranking' | 'point' | 'chara' | 'created_at'>

    try{
      if(!req.headers.authorization){
        res.send({
          status: status.error,
          message: 'この機能を利用するにはログインが必要です。'
        })
        return
      }
      const decoded = jwt.verify(req.headers.authorization, this.publicKey)
      Logger.createLog(decoded['user'], req.originalUrl, this.connection)

      const getOnlineUserFromUsersQuery = "SELECT DISTINCT player_name, ranking, point, chara, created_at FROM timeline WHERE created_at > ? and player_name <> 'プレーヤー' and diff > 0;"
      const nMinutesAgoTime = (new Date(Date.now() - (req.params.threshold ? req.params.threshold : this.defaultOnlineThreshold) * 1000 * 60))
      const [ result ] = await (await this.connection).execute(getOnlineUserFromUsersQuery, [ nMinutesAgoTime.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }) ])
      const onlinePlayers = result as TimelineForOnlinePlayer[]

      const usernameArray: string[] = []
      const responseArray = onlinePlayers.map((user: TimelineForOnlinePlayer) => {
        if(usernameArray.includes(user.player_name)){
          return null
        }else{
          usernameArray.push(user.player_name)
          return user
        }
      }).filter(r => !!r)
      res.send({
        status: status.ok,
        body: {
          players: responseArray,
          stage: identifyStage((new Date()).toLocaleString('ja-JP')),
        },
      })
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getMaxPointRanking(req: Request, res: Response) {
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const getMaxPointsFromTimelineQuery = "SELECT * FROM timeline WHERE player_name <> 'プレーヤー' AND elapsed < 360 AND created_at > '2023-06-01 08:00:00' AND diff > 0 ORDER BY diff desc LIMIT 100;";
      const [ result ] = await (await this.connection).execute(getMaxPointsFromTimelineQuery)
      const timelineResult = result as Timeline[]

      if (timelineResult.length > 0) {
        const response = timelineResult.map((r: Timeline) => ({
          ...r,
          created_at: undefined,
          updated_at: undefined,
          datetime: datetimeToTimeframe(r.updated_at ?? r.created_at, false)
        }))
        res.send({
          status: status.ok,
          body: response
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getAverageRanking(req: Request, res: Response) {
    try{
      if(!req.headers.authorization){
        res.send({
          status: status.error,
          message: 'この機能を利用するにはログインが必要です。'
        })
        return
      }
      const decoded = jwt.verify(req.headers.authorization, this.publicKey)
      Logger.createLog(decoded['user'], req.originalUrl, this.connection)

      const getUsersFromTimelineQuery = "SELECT player_name, chara, effective_average, deviation_value FROM players WHERE deviation_value > 50 ORDER BY effective_average DESC;";
      const [ result ] = await (await this.connection).execute(getUsersFromTimelineQuery)
      const usersResult = result as Pick<Players, 'player_name' | 'chara' | 'effective_average' | 'deviation_value'>[]

      if (usersResult.length > 0) {
        res.send({
          status: status.ok,
          body: usersResult
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }


  async statistics(req: Request, res: Response) {
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const getCharaFromTimelineQuery = "SELECT chara, diff, created_at FROM timeline ORDER BY created_at DESC;"
      const [ result ] = await (await this.connection).execute(getCharaFromTimelineQuery)
      const timelineResult = result as Timeline[]
      const data = {}
      const dateKeys: string[] = []

      if(timelineResult.length > 0) {
        let countForRanking = 0
        for(const r of timelineResult){
          const date = new Date(r.created_at)
          const y = date.getFullYear();
          const m = date.getMonth() + 1;
          const d = date.getDate();

          const yyyy = y.toString();
          const mm = ("00" + m).slice(-2);
          const dd = ("00" + d).slice(-2);

          const dateString = `${yyyy}-${mm}-${dd}`
          if(!data[dateString]) {
            dateKeys.unshift(dateString)
            data[dateString] = {}
            data[dateString].records = 0
            data[dateString].play = {
              //'0': { name: null, count: null, color: null },
              '1': { name: '赤鬼カギコ', count: 0, color: 'deeppink' },
              '2': { name: '悪亜チノン', count: 0, color: 'deepskyblue' },
              '3': { name: '不死ミヨミ', count: 0, color: 'gold' },
              '4': { name: 'パイン', count: 0, color: 'yellow' },
              '5': { name: '首塚ツバキ', count: 0, color: 'gainsboro' },
              '6': { name: '紅刃', count: 0, color: 'crimson' },
              '7': { name: '首塚ボタン', count: 0, color: 'orchid' },
              '8': { name: 'クルル', count: null, color: 'green' },
              '9': { name: 'ミロク', count: null, color: 'chartreuse' },
              '10':{ name: '最愛チアモ', count: 0, color: 'lightpink' },
              '11': { name: 'マラリヤ', count: 0, color: 'purple' },
              '12':{ name: 'ツバキ【廻】', count: 0, color: 'indigo' },
              '13':{ name: 'ジョウカ', count: 0, color: 'black' },
              '14':{ name: 'ジャスイ', count: 0, color: 'wheat' },
            }
            data[dateString].ranking = {
              //'0': { name: null, count: null, color: null },
              '1': { name: '赤鬼カギコ', count: 0, color: 'deeppink' },
              '2': { name: '悪亜チノン', count: 0, color: 'deepskyblue' },
              '3': { name: '不死ミヨミ', count: 0, color: 'gold' },
              '4': { name: 'パイン', count: 0, color: 'yellow' },
              '5': { name: '首塚ツバキ', count: 0, color: 'gainsboro' },
              '6': { name: '紅刃', count: 0, color: 'crimson' },
              '7': { name: '首塚ボタン', count: 0, color: 'orchid' },
              '8': { name: 'クルル', count: null, color: 'green' },
              '9': { name: 'ミロク', count: null, color: 'chartreuse' },
              '10':{ name: '最愛チアモ', count: 0, color: 'lightpink' },
              '11': { name: 'マラリヤ', count: 0, color: 'purple' },
              '12':{ name: 'ツバキ【廻】', count: 0, color: 'indigo' },
              '13':{ name: 'ジョウカ', count: 0, color: 'black' },
              '14':{ name: 'ジャスイ', count: 0, color: 'wheat' },
            }
            data[dateString].timeframe = [...Array(24)].map(() => 0)
            countForRanking = 0
          }

          // ranking
          if( countForRanking < 100){
            data[dateString].ranking[r.chara].count += 1
          }

          // each play
          if( r.diff > 0 ){
            data[dateString].play[r.chara].count += 1
            data[dateString].records++
            data[dateString].timeframe[date.getHours()] += 1
          }

          // count
          countForRanking++
        }
        res.send({
          status: status.ok,
          body:{
            data,
            dateKeys: dateKeys
          }
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。',
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async cleanInvalidRecords(req: Request, res: Response) {
    const [ result ] = await (await this.connection).execute('SELECT * FROM timeline WHERE player_name <> "プレーヤー";')
    const timelineResult = result as Timeline[]
    const requireToDelete: Pick<Timeline, 'timeline_id'>[] = []
    timelineResult.sort((a: Timeline, b: Timeline) => a.player_name.localeCompare(b.player_name))
    timelineResult.forEach((record: Timeline, i: number) => {
      if(i==0) return
      const last = result[i-1]
      if(record.point == last.point && record.player_name == last.user_name && record.diff > 0) {
        requireToDelete.push(last.timeline_id)
        console.log(last.player_name, last.point, record.point, record.diff, last.created_at, record.created_at)
      }
    })
    console.log(requireToDelete)
    requireToDelete.forEach(async(record) => {
      (await this.connection).execute('DELETE FROM timeline WHERE timeline_id = ?', [record])
    })
    res.send({
      'status': status.ok
    })
  }

  async getMatching(req: Request, res: Response) {
    try{
      const [ baseRecord ] = await (await (this.connection)).execute('SELECT * FROM timeline WHERE timeline_id = ?;', [ req.params.timelineId ])
      console.log(baseRecord[0])
      const { created_at, updated_at } = baseRecord[0] as Timeline
      const targetDateTime = isNull(updated_at) ? created_at : updated_at

      const [ targetRecords ] = await (await this.connection).execute(`SELECT * FROM timeline WHERE ${isNull(updated_at) ? 'created_at' : 'updated_at'} = ? AND diff > 0;`, [targetDateTime])
      const response = {
        id: req.params.timelineId,
        records: []
      }
      response.records = (targetRecords as Timeline[]).map((r: Timeline) => ({
        player_name: r.player_name,
        diff: r.diff,
        chara: r.chara,
      }))
      res.send({
        status: status.ok,
        body: response
      })
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async getEstOniRanker(req: Request, res: Response) {
    try{

      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const decodedToken = req.headers.authorization ? jwt.verify(req.headers.authorization, this.publicKey) : null
      const authorizedUserId = decodedToken ? decodedToken['user'] : null
      const isLoggedIn = authorizedUserId ? true : false

      if (!isLoggedIn) throw new Error()

      const [ gaugeRanking ] = await (await (this.connection)).execute("SELECT * FROM ( SELECT *, ROW_NUMBER() OVER (PARTITION BY player_name ORDER BY created_at DESC) as rn FROM timeline WHERE created_at >= '2024-01-01' AND exception = 'RANK_GAUGE_AS_POINTS' AND diff > 0 AND elapsed BETWEEN 60 AND 600 AND player_name <> 'プレーヤー') AS sub WHERE sub.rn = 1 order by diff desc;")
      const RANK_S_CONSTANTS = 1300
      const response = {
        top: gaugeRanking[0].diff - RANK_S_CONSTANTS,
        border: gaugeRanking[3].diff - RANK_S_CONSTANTS,
        players: (gaugeRanking as Timeline[]).map((r) => ({
          player_name: r.player_name,
          chara: r.chara,
          gauge: r.diff - RANK_S_CONSTANTS,
          updated_at: r.updated_at,
        }))
      }
      res.send({
        status: status.ok,
        body: response
      })
    }catch(e){
      res.send({
        status: status.error,
        message: e.message,
      })
    }
  }

}

export default Record
