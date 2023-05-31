const mysql = require('mysql2/promise');
const fs = require('fs');
const express = require("express");
const cors = require('cors');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

// 全角文字にする
function toFullWidth(str) {
  return str.replace(/[A-Za-z0-9]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  }).replace('.', '．');
}

// 時間帯フィルタリング
function hideDetailPlayTime(datetimeString) {
  const datetime = new Date(datetimeString)
  const month = datetime.getMonth() + 1
  const date = datetime.getDate()
  const dateString = ("00" + month).slice(-2) + "/" + ("00" + date).slice(-2) + " "

  const h = datetime.getHours()
  switch(h){
    case 2:
    case 3:
    case 4:
      return dateString + '未明'
    case 5:
    case 6:
    case 7:
      return dateString + '早朝'
    case 8:
    case 9:
    case 10:
      return dateString + '朝'
    case 11:
    case 12:
    case 13:
      return dateString + '昼'
    case 14:
    case 15:
    case 16:
      return dateString + '午下'
    case 17:
    case 18:
    case 19:
      return dateString + '夕'
    case 20:
    case 21:
    case 22:
      return dateString + '夜'
    case 23:
    case 0:
    case 1:
      return dateString + '深夜'
  }
}

const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});

// const
const defaultOnlineThreshold = 20;
const status = {
  ok: 'ok',
  error: 'error',
  undefined: 'undefind'
}

// ==== Web API ==== //
const app = express();
const server = app.listen(4400, () =>  console.log("Node.js is listening to PORT:" + server.address().port));
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(cookieParser())

const ranking = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    const getLatestRankingFromTimelineQuery = "SELECT ranking, player_name, point, chara FROM (SELECT * FROM timeline ORDER BY created_at DESC LIMIT 100) AS t ORDER BY ranking;"
    const [ result ] = await (await connection).execute(getLatestRankingFromTimelineQuery)
    if (result && result.length > 0){
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

const playerinfo = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    if( toFullWidth(req.params.playername) === 'プレーヤー' ){
      const response = {
        'player_name': toFullWidth(req.params.playername),
        'achievement': '',
        'chara': null,
        'point': 0,
        'ranking': 0,
        'online': false,
        'average': null,
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

    const getUserTimelineFromTimelineQuery = "SELECT * FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー' AND diff > 0 ORDER BY created_at;"
    const getUserAchievementFromTimelineQuery = "SELECT DISTINCT achievement FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー';"
    const [ [playLogResult], [prefectureResult] ] = await Promise.all([
      (await connection).execute(getUserTimelineFromTimelineQuery, [ toFullWidth(req.params.playername) ]),
      (await connection).execute(getUserAchievementFromTimelineQuery, [ toFullWidth(req.params.playername) ])
    ])

    if(playLogResult && playLogResult.length > 0){
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
        { name: '鳥取県', achievement: 'Bird get' },
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

      // 増分を計算する
      const latestRecord = playLogResult[playLogResult.length - 1]
      const response = {
        'player_name': toFullWidth(req.params.playername),
        'achievement': latestRecord.achievement,
        'chara': latestRecord.chara,
        'point': latestRecord.point,
        'ranking': latestRecord.ranking,
        'online': (new Date() - new Date(latestRecord.created_at)) <= defaultOnlineThreshold * 60 * 1000,
        'log': playLogResult.map((r) => ({
          ...r,
          created_at: hideDetailPlayTime(r.created_at)
        }),
        ).reverse(),
        'prefectures': prefectureAchievementTable.map(p => achievementArray.includes(toFullWidth(p.achievement)) ? p.name : null).filter(n => n)
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

const prefectures = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    const getUserAchievementFromTimelineQuery = "SELECT DISTINCT achievement FROM timeline WHERE player_name = ? AND player_name <> 'プレーヤー';"
    const [ result ] = await (await connection).execute(getUserAchievementFromTimelineQuery, [ toFullWidth(req.params.username) ])
    if(result && result.length > 0){
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
        { name: '鳥取県', achievement: 'Bird get' },
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
      const achievementArray = result.map(r => r.achievement)
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

const online = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    const getOnlineUserFromUsersQuery = "SELECT DISTINCT player_name, ranking, point, chara, created_at FROM timeline WHERE created_at > ? and player_name <> 'プレーヤー' and diff > 0;"
    const nMinutesAgoTime = (new Date(Date.now() - (req.params.threshold ? req.params.threshold : defaultOnlineThreshold) * 1000 * 60))
    const [ result ] = await (await connection).execute(getOnlineUserFromUsersQuery, [ nMinutesAgoTime.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }) ])
    if(result && result.length > 0){
      const usernameArray = []
      const responseArray = result.map((user) => {
        if(usernameArray.includes(user.player_name)){
          return null
        }else{
          usernameArray.push(user.player_name)
          return user
        }
      }).filter(r => !!r)
      res.send({
        status: status.ok,
        body: responseArray,
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

const maxPointRanking = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    const getMaxPointsFromTimelineQuery = "SELECT * FROM timeline WHERE player_name <> 'プレーヤー' AND elapsed < 360 AND created_at > '2023-05-06 08:00:00' AND diff > 0 ORDER BY diff desc LIMIT 100;";
    const [ result ] = await (await connection).execute(getMaxPointsFromTimelineQuery)
    if (result && result.length > 0) {
      const response = result.map((r) => ({
        ...r,
        created_at: hideDetailPlayTime(r.created_at)
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

const statistics = async(req, res) => {
  try{
    if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
    const getCharaFromTimelineQuery = "SELECT chara, diff, created_at FROM timeline ORDER BY created_at DESC;"
    const [ result ] = await (await connection).execute(getCharaFromTimelineQuery)
    const data = {}
    const dateKeys = []

    if(result && result.length > 0) {
      let countForRanking = 0
      for(const r of result){
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
            //'8': { name: null, count: null, color: null },
            //'9': { name: null, count: null, color: null },
            '10':{ name: '最愛チアモ', count: 0, color: 'lightpink' },
            '11': { name: 'マラリヤ', count: 0, color: 'purple' },
            '12':{ name: 'ツバキ【廻】', count: 0, color: 'indigo' },
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
            //'8': { name: null, count: null, color: null },
            //'9': { name: null, count: null, color: null },
            '10':{ name: '最愛チアモ', count: 0, color: 'lightpink' },
            '11': { name: 'マラリヤ', count: 0, color: 'purple' },
            '12':{ name: 'ツバキ【廻】', count: 0, color: 'indigo' },
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

const trackingLog = async(tracker, endpoint) => {
  const insertIntoLogQuery = "INSERT INTO log (tracker, visit) VALUES (?);";
  await (await connection).query(insertIntoLogQuery, [[tracker, endpoint]])
}

const generateTracker = (req, res) => {
  const trackerUuid = crypto.randomUUID()
  res.send({
    'status': 'ok',
    'tracker': trackerUuid
  })
}

const cleanInvalidRecords = async(req, res) => {
  const [ result ] = await (await connection).execute('SELECT * FROM timeline WHERE player_name <> "プレーヤー";')
  const requireToDelete = []
  result.sort((a, b) => a.player_name.localeCompare(b.player_name))
  result.forEach((record, i) => {
    if(i==0) return
    const last = result[i-1]
    if(record.point == last.point && record.user_name == last.user_name && record.diff > 0) {
      requireToDelete.push(last.timeline_id)
      console.log(last.player_name, last.point, record.point, record.diff, last.created_at, record.created_at)
    }
  })
  console.log(requireToDelete)
  requireToDelete.forEach(async(record) => {
    (await connection).execute('DELETE FROM timeline WHERE timeline_id = ?', [record])
  })
  res.send({
    'status': status.ok
  })
}

app.get('/api/ranking', (req, res) => {ranking(req, res)})
app.get('/api/max-ranking', (req, res) => {maxPointRanking(req, res)})
app.get('/api/players/:playername', (req, res) => {playerinfo(req, res)})
app.get('/api/players/:playername/prefectures', (req, res) => {prefectures(req, res)})
app.get('/api/online/:threshold?', (req, res) => {online(req, res)})
app.get('/api/stats', (req, res) => {statistics(req, res)})
app.post('/api/tracker', (req, res) => {generateTracker(req, res)})
app.post('/api/clean', (req, res) => {cleanInvalidRecords(req, res)})
