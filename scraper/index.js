const mysql = require('mysql2/promise');
const util = require('util');
const { JSDOM } = require('jsdom')

var processing = false

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
}

const main = async() => {
  processing = true
  console.log(new Date())
  console.log('** START')
  // 最終更新を取得
  const [ lastUpdatedAtResult ] = await (await connection).execute('SELECT updated_at FROM timeline ORDER BY updated_at DESC LIMIT 1;');

  // 最初の１ページを取得
  const page = await fetchRankingPage(0)
  console.log('== GOT Official Ranking')
  console.log(`   Updated at ${page.updatedAt} <Official>`)
  console.log(`   Updated at ${new Date(lastUpdatedAtResult[0].updated_at)} <DB>`)
  if (new Date(lastUpdatedAtResult[0].updated_at).getTime() === page.updatedAt.getTime()){
    console.log(`** Escape.`)
    processing = false
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
  const rawRankingData = (await Promise.all(rawRankingPromisses)).filter((record) => record[5] > 0)
  console.log('== GENERATED rawRankingData')

  const insertIntoTimelineQuery = "INSERT INTO timeline (player_name, ranking, achievement, chara, point, diff, elapsed, last_timeline_id, updated_at ) VALUES ?;";
  const [ result, error ] = await (await connection).query(insertIntoTimelineQuery, [rawRankingData])

  console.log('** All Done.')
  console.log(new Date())
  processing = false
}

const calculateStandardDeviation = async() => {
  // 全データを取得
  const [ allRecords ] = await (await connection).execute('SELECT diff FROM timeline WHERE player_name <> "プレーヤー" AND elapsed < 600 AND diff BETWEEN 50 AND 500;')
  const data = allRecords.map(r => r.diff)

  // 平均
  const sum = data.reduce((acc, value) => acc + value, 0);
  const mean = sum / data.length;

  // 分散と偏差を算出
  const squaredDifferencesSum = data.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0);
  const variance = squaredDifferencesSum / data.length;
  const standardDeviation = Math.sqrt(variance);

  // TEST
  console.log(`データ件数: ${data.length}`)
  console.log(`平均      : ${mean}`)
  console.log(`標準偏差  : ${standardDeviation.toFixed(3)}`)

  const points = [50, 100, 130, 160, 190, 220, 250, 280, 300, 320, 340, 360, 380]
  points.forEach((p) => {
    console.log( `${p}P -> ${((p-mean) / standardDeviation * 10 + 50).toFixed(3)}` )
  })
}

// プレイヤーの偏差値を算出
const calculateDeviationValue = async() => {
  console.log('== START Calc. DV')
  // プレイヤーの総数を取得
  console.log('  ** GET players')
  const [ allPlayersNameResult ] = await (await connection).execute('SELECT DISTINCT player_name FROM timeline WHERE player_name <> "プレーヤー" AND diff BETWEEN 50 AND 500;')
  const allPlayersName = allPlayersNameResult.map(r => r.player_name)
  console.log(`  ** Done. ${allPlayersName.length} players found. Index 0 is '${allPlayersName[0]}'.`)

  // プレイヤーのデータを取得する
  console.log('  ** GET records')
  const allPlayersRecordPromise = allPlayersName.map(async(playerName) => {
    const [ result ] = await (await connection).execute('SELECT diff FROM timeline WHERE player_name = ? AND elapsed < 600 AND diff BETWEEN 50 AND 500 ORDER BY created_at DESC LIMIT 110;', [playerName])
    return result
  })
  const allPlayersRecord = await Promise.all(allPlayersRecordPromise)
  console.log(`  ** Done. ${allPlayersRecord.length} players' records found. Index 0 is ${allPlayersRecord[0][0].diff} P.`)

  // 各プレイヤーの有効平均貢献ポイントを算出する
  const allPlayersData = allPlayersRecord.map((records, index) => {
    return records.length < 110 ? null : ({
      name: allPlayersName[index],
      records,
      availAverage: records.sort((a, b) => a.diff > b.diff).slice(5, -5).reduce((acc, value) => acc + value.diff, 0) / 100
    })
  }).filter(r => r !== null)
  console.log(`  ** There are ${allPlayersData.length} players who has more than 110 records.`)

  // 全体の有効平均貢献ポイントの平均を算出する
  const averageOfAvailAverageOfAllPlayer = allPlayersData.map((player) => player.availAverage).reduce((acc, value) => acc + value, 0) / allPlayersData.length

  // 分散と偏差を算出する
  const squaredDifferencesSum = allPlayersData.map((player) => player.availAverage).reduce((acc, value) => acc + Math.pow(value - averageOfAvailAverageOfAllPlayer, 2), 0)
  const variance = squaredDifferencesSum / allPlayersData.length
  const standardDeviation = Math.sqrt(variance)

  // データベースに格納する
  allPlayersData.map(async(player) => {
    const [ record ] = await (await connection).execute('SELECT player_id FROM players WHERE player_name = ? LIMIT 1', [player.name])
    const isExist = record.length > 0
    const deviationValue = (player.availAverage - averageOfAvailAverageOfAllPlayer) / standardDeviation * 10 + 50
    if(isExist){
      const player_id = record[0].player_id
      await (await connection).query('UPDATE players SET effective_average = ?, deviation_value = ?, updated_at = ? WHERE player_id = ?', [player.availAverage, deviationValue, new Date(),  player_id])
    }else{
      const [ LatestRecordResult ] = await (await connection).execute('SELECT * FROM timeline WHERE player_name = ? ORDER BY created_at DESC LIMIT 1', [player.name])
      const LatestRecord = LatestRecordResult[0]
      await (await connection).query('INSERT INTO players (player_name, ranking, achievement, chara, point, effective_average, deviation_value) VALUES (?)', [[LatestRecord.player_name, LatestRecord.ranking, LatestRecord.achievement, LatestRecord.chara, LatestRecord.point, player.availAverage, deviationValue]])
    }
    console.log(`${player.name} ${deviationValue.toFixed(3)}`)
  })
}

// 注) 関数名の`2`はCCJのcampaignの番号を指す
const present_campaign_2 = async() => {
  const campaignPrefix = '2023summer'
  const page = await fetch(`https://p.eagate.573.jp/game/chase2jokers/ccj/campaign/2/`)
  const html = await page.text()
  const dom = new JSDOM(html, 'text/html')
  const document = dom.window.document
  const itemList = document.getElementsByClassName('item_list')[0].children
  const standElm = document.getElementById('chara_stand').getElementsByTagName('li')
  console.log(itemList)
  const ePassRemain = [...itemList].map((item) => {
    return{
      product: 'e-pass 『' + item.getElementsByTagName('img')[0].alt + '』',
      count: Number(item.getElementsByTagName('p')[0].innerHTML.match(/\d+/g)[0]),
      remain: Number(item.getElementsByTagName('p')[2].innerHTML.match(/\d+/g)[0]),
    }
  })
  const standRemain = {
    product: standElm[0].textContent.replaceAll(' ', ''),
    count: Number(standElm[2].getElementsByTagName('p')[0].innerHTML.match(/\d+/g)[0]),
    remain: Number(standElm[2].getElementsByTagName('p')[2].innerHTML.match(/\d+/g)[0]),
  };
  console.log(standRemain, ePassRemain);
  ([ standRemain, ...ePassRemain ]).map(async(item) => {
    const identify_name = campaignPrefix + item.product
    const [ dbItem ] = await (await connection).execute(`SELECT * FROM presents WHERE identify_name = '${identify_name}' order by updated_at DESC limit 1`)
    if (dbItem.length <= 0 || dbItem[0].remain != item.remain){
      await (await connection).query(`INSERT INTO presents (identify_name, original_name, count, remain, diff) VALUES (?)`, [[ identify_name, item.product, item.count, item.remain, dbItem.length > 0 ? dbItem[0].remain - item.remain : 0 ]])
    }
  })
}

present_campaign_2()
setInterval(() => {
  const date = new Date()
  if(!processing && (date.getHours() <= 0 || date.getHours() >= 7 )) {
    main()
    present_campaign_2()
  }
  if(date.getHours() === 4 && date.getMinutes() < 2) calculateDeviationValue()
}, 1000 * 120)
