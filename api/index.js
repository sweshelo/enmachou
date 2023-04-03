const { JSDOM } = require('jsdom')
const mysql = require('mysql');
const fs = require('fs');
const {resolve} = require('dns');
const baseUrl = `https://p.eagate.573.jp/game/chase2jokers/ccj/ranking/index.html`

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

const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});

// Icon
const regExp = /ranking_icon_([0-9]{1,2}).png/;

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
          /*
          return({
            'rank': parseInt(data.querySelector('div').textContent),
            'chara': data.querySelector('img').src,
            'achievement': [...data.querySelectorAll('div')][1].querySelector('span').textContent,
            'player': [...data.querySelectorAll('div')][1].querySelectorAll('p')[1].childNodes[1].textContent,
            'point': parseInt([...data.querySelectorAll('div')][2].childNodes[0].textContent),
          })
          */
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
  console.log('rankingData: ', rankingData)

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
          console.log(err)
          reject()
        }
      })
    })
  })
  await Promise.all(sqlPromisses)
  console.log('promisses waited.')

  // 新規ユーザを登録
  if(create.length > 0){
    const insertIntoUserQuery = "INSERT INTO users (user_name, ranking, achievement, chara, point) VALUES ?;";
    connection.query(insertIntoUserQuery, [create], (err, result) => {
      console.log('create: ', err, result)
    })
  }

  const insertIntoTimelineQuery = "INSERT INTO timeline (user_name, ranking, achievement, chara, point) VALUES ?;";
  connection.query(insertIntoTimelineQuery, [rankingData], (err, result) => {
    if(err) console.log(err)
    if(result) console.log(result)
  })
}

main()
setInterval(() => {
  main()
  console.log('Recorded.' + now())
}, 1000 * 60 * 5)
