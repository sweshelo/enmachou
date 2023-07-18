const mysql = require('mysql2/promise');
const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});


(async() => {
  console.log(`Start ${new Date()}`)
  const [ records ] = await (await connection).execute('SELECT * FROM timeline WHERE created_at > "2023-07-13 00:00:00";');
  const playerMap = {};
  records.forEach((item) => {
    const player_name = item['player_name'];
    if (!playerMap[player_name]) {
      playerMap[player_name] = [];
    }
    playerMap[player_name].push(item);
  });
  const resultArray = Object.values(playerMap);
  let counter = 0
  let fixedRecord = []
  resultArray.forEach((player) => {
    player.sort((a, b) => a.created_at > b.created_at)
    player.forEach((record, index) => {
      if (index === 0) return
      const diff = record.point - player[index - 1].point
      const elapsed = (new Date(record.updated_at) - new Date(player[index-1].updated_at)) / 1000
      if (diff != record.diff || Math.abs(elapsed - record.elapsed) > 60){
        console.log(
          `${record.point} - ${player[index - 1].point} = ${diff}, but ${record.diff} recorded.`
        );
        counter++;
        fixedRecord.push([diff, player[index-1].timeline_id, (new Date(record.updated_at) - new Date(player[index-1].updated_at)) / 1000, record.timeline_id])
      }else{
        console.log('OK.')
      }
    })
    console.log(counter)
  })

  const promises = fixedRecord.map(async(record) => {
    await (await connection).query('UPDATE timeline SET diff = ?, last_timeline_id = ?, elapsed = ? WHERE timeline_id = ?', record)
  })
  await Promise.all(promises)
  console.log('Done.')
})();
