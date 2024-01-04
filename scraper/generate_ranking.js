const mysql = require('mysql2/promise');
const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});


(async () => {
  console.log(`Start ${new Date()}`)
  const [records] = await (await connection).execute('SELECT * FROM ( SELECT *, ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at DESC) as rn FROM timeline) AS sub WHERE sub.rn <= 100 ORDER BY sub.updated_at DESC;');
  const splitByDateRecords = {}
  records.forEach((record) => {
    const time = new Date(record.updated_at ?? record.created_at)
    const date = time.toLocaleDateString('sv-SE')
    if (date !== 'Invalid Date') {
      if (!splitByDateRecords[date]) {
        splitByDateRecords[date] = {
          records: []
        }
      }
      splitByDateRecords[date].records.push(record)
    }
  })
  console.log(splitByDateRecords)
  const object = Object.entries(splitByDateRecords).map(([date, ranking]) => ({ date, ranking })).map((record) => {
    return record.ranking.records.map((ranking) => {
      return ([
        ranking.player_name,
        ranking.point,
        ranking.ranking,
        ranking.chara,
        ranking.updated_at ?? ranking.created_at,
        record.date,
        'standard',
      ])
    })
  })
  const [result] = await (await connection).query('INSERT INTO ranking (player_name, point, ranking, chara, created_at, record_date, ranking_type) VALUES ?', [object.flat()])
  console.log(result)
})()
