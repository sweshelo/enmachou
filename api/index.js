const { JSDOM } = require('jsdom')
const mysql = require('mysql');
const fs = require('fs');
const express = require("express");
const cors = require('cors');

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
    return fetch(`${baseUrl}?page=${index}&rid=202304`)
      .then(r => r.text())
      .then(r => {
        const dom = new JSDOM(r, 'text/html')
        const document = dom.window.document
        rankingData.push(...[...document.querySelector('#ranking_data').children].slice(1, 26).map(data => {
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
  const sqlPromisses = rankingData.map((data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM users WHERE user_name = ?;`, data[0], (err, result) => {
        if(result){
          if([...result].length === 0){
            create.push(data)
            resolve()
          }else{
            const updateUserQuery = "UPDATE users SET ranking = ?, achievement = ?, chara = ?, point = ?, rank_diff = ?, point_diff = ?, updated_at = ? WHERE user_name = ?;"
            const diff = (data[0] == 'プレーヤー') ? null : data[4] - result[0].point
            const rank = (data[0] == 'プレーヤー') ? null : data[1] - result[0].ranking
            const date = (diff > 0) ? (new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })) : result[0].updated_at
            connection.query(updateUserQuery, [data[1], data[2], data[3], data[4], rank, diff, date, data[0]], (err, result) => {
              resolve()
            })
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
    const insertIntoUserQuery = "INSERT INTO users (user_name, ranking, achievement, chara, point) VALUES ?;";
    connection.query(insertIntoUserQuery, [create], (err, result) => {
      if(err){
        console.error(`[${now()}] ERROR @ CREATE - ${err}`)
      }else{
        console.log(`[${now()}] created.`)
      }
    })
  }

  const insertIntoTimelineQuery = "INSERT INTO timeline (user_name, ranking, achievement, chara, point) VALUES ?;";
  connection.query(insertIntoTimelineQuery, [rankingData], (err, result) => {
    if(err){
      console.error(`[${now()}] ERROR - @ UPDATE ${err}`)
    }else{
      console.log(`[${now()}] updated.`)
    }
  })
}

main()
setInterval(() => {
  main()
  console.log(`[${now()}] recorded.`)
}, 1000 * 60 * 5)

// ==== Web API ==== //
const app = express();
const server = app.listen(4400, () =>  console.log("Node.js is listening to PORT:" + server.address().port));
app.use(cors());

const ranking = (req, res) => {
  const getLatestRankingFromTimelineQuery = "SELECT ranking, user_name, point, chara FROM (SELECT * FROM timeline ORDER BY created_at DESC LIMIT 100) AS t ORDER BY ranking;"
  connection.query(getLatestRankingFromTimelineQuery, (err, result) => {
    if(result){
      res.send(result)
    }
  })
}

const userinfo = (req, res) => {
  const getUserTimelineFromTimelineQuery = "with records as (select timeline_id, user_name, point, row_number() over (partition by point order by timeline_id) as row_num from timeline) select * from timeline where timeline_id in (select timeline_id from records where row_num = 1) and user_name = ? order by created_at;"
  connection.query(getUserTimelineFromTimelineQuery, [ toFullWidth(req.params.username) ], (err, result) => {
    if(result){
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
        'diff': pointDiff,
        'log': result,
      }
      res.send(response)
    }
  })
}

const online = (req, res) => {
  const getOnlineUserFromUsersQuery = "SELECT user_name FROM users WHERE updated_at > ?;"
  const nMinutesAgoTime = (new Date(Date.now() - (req.params.threshold ? req.params.threshold : defaultOnlineThreshold) * 1000 * 60))
  connection.query(getOnlineUserFromUsersQuery, [ nMinutesAgoTime.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }) ], (err, result) => {
    res.send(result)
  })
}

app.get('/api/ranking', (req, res) => {ranking(req, res)})
app.get('/api/users/:username', (req, res) => {userinfo(req, res)})
app.get('/api/online/:threshold?', (req, res) => {online(req, res)})
