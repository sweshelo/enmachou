const mysql = require('mysql2/promise');
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

const fetchRankingPage = async(pageIndex) => {
  try{
    const page = await fetch(`${baseUrl}?page=${pageIndex}&rid=${now().substring(0,6)}`)
    const html = await page.text()
    const dom = new JSDOM(html, 'text/html')
    const document = dom.window.document
    const pageInfomation = {
      index: pageIndex,
      rankingData: [],
      updatedAt: null,
    }
    pageInfomation.updatedAt = new Date(document.querySelectorAll('.inner_box dd > p')[3].textContent.slice(5).replaceAll('.', '/'))
    pageInfomation.rankingData.push(...[...document.querySelector('#ranking_data')?.children].slice(1, 26).map(data => {
      const match = data.querySelector('img').src.match(regExp);
      const number = match ? match[1] : null;
      const playerName = [...data.querySelectorAll('div')][1].querySelectorAll('p')[1].childNodes[1].textContent
      return({
        playerName: playerName,
        ranking: parseInt(data.querySelector('div').textContent), // ranking
        achievement: [...data.querySelectorAll('div')][1].querySelector('span').textContent, // achievement
        chara: number, // photo
        point: parseInt([...data.querySelectorAll('div')][2].childNodes[0].textContent), // point
      })
    }))
    return pageInfomation
  }catch(e){
    console.error(e)
    return
  }
}

const main = async() => {
  console.log(new Date())
  console.log('** START')
  // 最終更新を取得
  const [ lastUpdatedAtResult ] = await (await connection).execute('SELECT updated_at FROM timeline ORDER BY updated_at DESC LIMIT 1;');

  // 最初の１ページを取得
  const page = await fetchRankingPage(0)
  if(!page){
    console.log('== Failed to get Official Ranking')
    console.log(`** Escape.`)
    return
  }
  console.log('== GOT Official Ranking')
  console.log(`   Updated at ${page.updatedAt} <Official>`)
  console.log(`   Updated at ${new Date(lastUpdatedAtResult[0].updated_at)} <DB>`)
  if (new Date(lastUpdatedAtResult[0].updated_at).getTime() === page.updatedAt.getTime()){
    console.log(`** Escape.`)
    return
  }

  // 残りの３ページを取得
  const fetchPromisses = [1, 2, 3].map(index => fetchRankingPage(index))
  await Promise.all(fetchPromisses)
  console.log(`== GOT Official Ranking`)
  console.log(`== GETTING LatestRecords ...`)

  // 取得結果 合算
  const rankingData = [
    ...page.rankingData,
    ...(await fetchPromisses[0]).rankingData,
    ...(await fetchPromisses[1]).rankingData,
    ...(await fetchPromisses[2]).rankingData,
  ]

  // IN句で用いるplayer_name配列
  const playerNameArray = rankingData.map(r => r.playerName !== 'プレーヤー' ? r.playerName : null).filter((r) => !!r)
  const getLatestRecordEachPlayerFromTimeline = `
SELECT t.*
FROM timeline t
WHERE t.player_name IN (${playerNameArray.map(() => '?').join(',')})
AND t.created_at = (
    SELECT MAX(created_at)
    FROM timeline
    WHERE player_name = t.player_name
);`
  const [ latestRecords ] = await (await connection).execute(getLatestRecordEachPlayerFromTimeline, playerNameArray)
  console.log(`== GOT LatestRecords`)

  const rawRankingPromisses = rankingData.map(async(record) => {
    console.log(`== CALC. Diff`)
    console.log(`   ${record.playerName}`)
    const playerLatestRecord = latestRecords.find(r => r.player_name === record.playerName)
    return [
      record.playerName,
      record.ranking,
      record.achievement,
      record.chara,
      record.point,
      playerLatestRecord ? record.point - playerLatestRecord.point : null,
      playerLatestRecord ? (new Date() - new Date(playerLatestRecord.created_at)) / 1000 : null,
      playerLatestRecord ? playerLatestRecord.timeline_id : null,
      page.updatedAt
    ]
  })
  const rawRankingData = await Promise.all(rawRankingPromisses)
  console.log('== GENERATED rawRankingData')

  const insertIntoTimelineQuery = "INSERT INTO timeline (player_name, ranking, achievement, chara, point, diff, elapsed, last_timeline_id, updated_at ) VALUES ?;";
  const [ result, error ] = await (await connection).query(insertIntoTimelineQuery, [rawRankingData])

  console.log('** All Done.')
  console.log(new Date())
}

setInterval(() => {
  main()
}, 1000 * 60)
