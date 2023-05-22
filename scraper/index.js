const mysql = require('mysql');
const { JSDOM } = require('jsdom')

const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});

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
      connection.query(`SELECT * FROM timeline WHERE player_name = ? ORDER BY created_at DESC LIMIT 1;`, data[0], (err, result) => {
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
    const insertIntoUserQuery = "INSERT INTO users (player_name, ranking, achievement, chara, point) VALUES ?;";
    connection.query(insertIntoUserQuery, [create], (err, result) => {
      if(err){
        console.error(`[${now()}] ERROR @ CREATE - ${err}`)
      }else{
        console.log(`[${now()}] created.`)
      }
    })
  }

  const insertIntoTimelineQuery = "INSERT INTO timeline (player_name, ranking, achievement, chara, point, diff, elapsed, last_timeline_id ) VALUES ?;";
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
  3, 0,
  // 2~
  0, 0, 0,
  // 5 (under maintenance)
  0, 0, 0,
  // 8~
  3, 3,
  // 10~
  2, 2, 2, 2, 2, 2,
  // 16~
  1, 1, 1, 1, 1,
  // 21~
  3, 3, 3 ]

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

