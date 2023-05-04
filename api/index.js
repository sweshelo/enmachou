const { JSDOM } = require('jsdom')
const mysql = require('mysql');
const fs = require('fs');
const express = require("express");
const cors = require('cors');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

// 「yyyymmdd」形式の日付文字列に変換する関数
function now() {
  const date = new Date();

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const yyyy = y.toString();
  const mm = ("00" + m).slice(-2);
  const dd = ("00" + d).slice(-2);

  const h = date.getHours();
  const min = date.getMinutes();
  const s = date.getSeconds();

  const hh = ("00" + h).slice(-2);
  const mi = ("00" + min).slice(-2);
  const ss = ("00" + s).slice(-2);

  return yyyy + mm + dd + hh + mi + ss;
};

// 全角文字にする
function toFullWidth(str) {
  return str.replace(/[A-Za-z0-9]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  });
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
const baseUrl = `https://p.eagate.573.jp/game/chase2jokers/ccj/ranking/index.html`
const regExp = /ranking_icon_([0-9]{1,2}).png/;
const defaultOnlineThreshold = 20;

const main = async() => {
  const rankingData = []
  const array = [0, 1, 2, 3]
  const fetchPromisses = array.map(index => {
    return fetch(`${baseUrl}?page=${index}&rid=${now().substring(0,6)}`)
      .then(r => r.text())
      .then(r => {
        const dom = new JSDOM(r, 'text/html')
        const document = dom.window.document
        rankingData.push(...[...document.querySelector('#ranking_data')?.children].slice(1, 26).map(data => {
          const match = data.querySelector('img').src.match(regExp);
          const number = match ? match[1] : null;
          const username = [...data.querySelectorAll('div')][1].querySelectorAll('p')[1].childNodes[1].textContent
          return([
            username,
            parseInt(data.querySelector('div').textContent), // ranking
            [...data.querySelectorAll('div')][1].querySelector('span').textContent, // achievement
            number, // photo
            parseInt([...data.querySelectorAll('div')][2].childNodes[0].textContent), // point
          ])
        }))
      })
  })

  await Promise.all(fetchPromisses)

  const create = []
  const sqlPromisses = rankingData.map((data, index) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM timeline WHERE user_name = ? ORDER BY created_at DESC LIMIT 1;`, data[0], (err, result) => {
        if(result){
          if([...result].length === 0){
            create.push(data)
            rankingData[index].push(null)
            rankingData[index].push(null)
            rankingData[index].push(null)
            resolve()
          }else{
            const diff = (data[0] == 'プレーヤー') ? null : data[4] - result[0].point
            rankingData[index].push(diff || null)
            rankingData[index].push(Math.floor((new Date() - new Date(result[0].created_at))/1000) || null)
            rankingData[index].push(result[0].timeline_id || null)
            resolve()
          }
        }
        if(err){
          console.log(`[${now()}] ERROR @ SELECT - ${err}`)
          reject()
        }
      })
    })
  })
  await Promise.all(sqlPromisses)
  console.log(`[${now()}] Promisses waited.`)

  // 新規ユーザを登録
  if(create.length > 0){
    console.log(create)
    const insertIntoUserQuery = "INSERT INTO users (user_name, ranking, achievement, chara, point) VALUES ?;";
    connection.query(insertIntoUserQuery, [create], (err, result) => {
      if(err){
        console.error(`[${now()}] ERROR @ CREATE - ${err}`)
      }else{
        console.log(`[${now()}] created.`)
      }
    })
  }

  const insertIntoTimelineQuery = "INSERT INTO timeline (user_name, ranking, achievement, chara, point, diff, elapsed, last_timeline_id ) VALUES ?;";
  connection.query(insertIntoTimelineQuery, [rankingData], (err, result) => {
    if(err){
      console.error(`[${now()}] ERROR - @ UPDATE ${err}`)
    }else{
      console.log(`[${now()}] updated.`)
    }
  })
}

const updateInterval = [
  // 0~
  4, 4,
  // 2~
  30, 30, 30,
  // 5 (under maintenance)
  0, 0, 0,
  // 8~
  5, 5,
  // 10~
  4, 4, 4, 4, 4, 4, 4,
  // 17~
  2, 2, 2, 2,
  // 21~
  4, 4, 4 ]

setInterval(() => {
  const nowTime = new Date()
  const nowInterval = updateInterval[nowTime.getHours()]
  if ( nowInterval != 0 && (nowTime.getMinutes() % updateInterval[nowTime.getHours()]) == 0){
    main()
    console.log(`[${now()}] recorded.`)
  }else{
    console.log(`[Pass] Current update interval: '${nowInterval}'`)
  }
}, 1000 * 60)

// ==== Web API ==== //
const app = express();
const server = app.listen(4400, () =>  console.log("Node.js is listening to PORT:" + server.address().port));
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(cookieParser())

const ranking = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  const getLatestRankingFromTimelineQuery = "SELECT ranking, user_name, point, chara FROM (SELECT * FROM timeline ORDER BY created_at DESC LIMIT 100) AS t ORDER BY ranking;"
  connection.query(getLatestRankingFromTimelineQuery, (err, result) => {
    if(result){
      res.send(result)
    }
  })
}

const userinfo = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  if( toFullWidth(req.params.username) === 'プレーヤー' ){
    const response = {
      'user_name': toFullWidth(req.params.username),
      'achievement': '',
      'chara': null,
      'point': 0,
      'ranking': 0,
      'online': false,
      'average': null,
      'diff': [],
      'log': [],
    }
    res.send(response)
    return
  }

  const getUserTimelineFromTimelineQuery = "SELECT * FROM timeline WHERE user_name = ? AND user_name <> 'プレーヤー' AND diff > 0 ORDER BY created_at;"
  connection.query(getUserTimelineFromTimelineQuery, [ toFullWidth(req.params.username) ], (err, result) => {
    if(result && result.length > 0){
      // 増分を計算する
      const pointDiff = result.map((record, i, arr) => i === 0 ? record.point : record.point - arr[i - 1].point).slice(1);
      const average = pointDiff.reduce((acc, cur) => acc + cur, 0) / pointDiff.length;
      const latestRecord = result[result.length - 1]
      const response = {
        'user_name': toFullWidth(req.params.username),
        'achievement': latestRecord.achievement,
        'chara': latestRecord.chara,
        'point': latestRecord.point,
        'ranking': latestRecord.ranking,
        'online': (new Date() - new Date(latestRecord.created_at)) <= defaultOnlineThreshold * 60 * 1000,
        'average': average,
        'diff': pointDiff.reverse(),
        'log': result.map((r) => ({
          ...r,
          created_at: hideDetailPlayTime(r.created_at)
        })
        ).reverse(),
      }
      res.send(response)
    }else{
      res.send({error: 'something went wrong'})
    }
  })
}

const prefectures = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  const getUserAchievementFromTimelineQuery = "SELECT DISTINCT achievement FROM timeline WHERE user_name = ? AND user_name <> 'プレーヤー';"
  connection.query(getUserAchievementFromTimelineQuery, [ toFullWidth(req.params.username) ], (err, result) => {
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
      res.send({error: 'something went wrong'})
    }
  })
}

const online = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  const getOnlineUserFromUsersQuery = "SELECT DISTINCT user_name, ranking, point, chara, created_at FROM timeline WHERE created_at > ? and user_name <> 'プレーヤー' and diff > 0;"
  const nMinutesAgoTime = (new Date(Date.now() - (req.params.threshold ? req.params.threshold : defaultOnlineThreshold) * 1000 * 60))
  connection.query(getOnlineUserFromUsersQuery, [ nMinutesAgoTime.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }) ], (err, result) => {
    if(result){
      const usernameArray = []
      const responseArray = result.map((user) => {
        if(usernameArray.includes(user.user_name)){
          return null
        }else{
          usernameArray.push(user.user_name)
          return user
        }
      }).filter(r => !!r)
      res.send(responseArray)
    }else{
      res.send({error: 'something went wrong'})
    }
  })
}

const maxPointRanking = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  const getMaxPointsFromTimelineQuery = "SELECT * FROM timeline WHERE user_name <> 'プレーヤー' AND elapsed < 360 AND created_at > '2023-05-05 00:00:00' ORDER BY diff desc LIMIT 100;";
  connection.query(getMaxPointsFromTimelineQuery, (err, result) => {
    if(result) {
      const response = result.map((r) => ({
        ...r,
        created_at: hideDetailPlayTime(r.created_at)
      }))
      res.send(response)
    }
    if(err) res.send({error: 'something went wrong'})
  })
}

const chara = (req, res) => {
  if (req.cookies.tracker) trackingLog(req.cookies.tracker, req.originalUrl)
  const getCharaFromTimelineQuery = "SELECT chara, diff, created_at FROM timeline ORDER BY created_at DESC;"
  connection.query(getCharaFromTimelineQuery, (err, result) => {
    const data = {}
    const dateKeys = []

    if(result) {
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
            //'11': { name: null, count: null, color: null },
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
            //'11': { name: null, count: null, color: null },
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
      res.send({data, dateKeys: dateKeys})
    }
  })
}

const trackingLog = (tracker, endpoint) => {
  const insertIntoLogQuery = "INSERT INTO log (tracker_id, visit) VALUES ?;";
  connection.query(insertIntoLogQuery, [tracker, endpoint])
}

const generateTracker = (req, res) => {
  const trackerUuid = crypto.randomUUID()
  res.cookie('tracker', trackerUuid)
  res.send({
    'status': 'ok',
    'tracker': trackerUuid
  })
}

app.get('/api/ranking', (req, res) => {ranking(req, res)})
app.get('/api/max-ranking', (req, res) => {maxPointRanking(req, res)})
app.get('/api/users/:username', (req, res) => {userinfo(req, res)})
app.get('/api/users/:username/prefectures', (req, res) => {prefectures(req, res)})
app.get('/api/online/:threshold?', (req, res) => {online(req, res)})
app.get('/api/stats/chara', (req, res) => {chara(req, res)})
app.post('/api/tracker', (req, res) => {generateTracker(req, res)})
