const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});

const generateDiffRecords = ( records ) => {
  const record = records.sort((a, b) => (a.user_name === b.user_name) ? a.created_at > b.created_at : a.user_name.localeCompare(b.user_name)).map((r, index) => {
    if(index === 0 || index === records.length -1 || records[index - 1].user_name !== r.user_name ) return [r.user_name, r.achievement, r.chara, r.point, r.created_at, null, null, null, r.timeline_id]
    return [r.user_name, r.achievement, r.chara, r.point, r.created_at, r.point - records[index -1].point, records[index - 1].timeline_id, (r.created_at - records[index - 1].created_at)/1000, r.timeline_id]
  })

  console.log(record)

  const query = 'update timeline set user_name = ?, achievement = ?, chara = ?, point = ?, created_at = ?, diff = ?, last_timeline_id = ?, elapsed = ? where timeline_id = ?';
  record.forEach( r => {
    const [user_name, achievement, chara, point, created_at, diff, last_timeline_id, elapsed, timeline_id] = r;
    connection.query(query, [user_name, achievement, chara, point, created_at, diff, last_timeline_id, elapsed, timeline_id], (err, result) => {
      console.log(err, result);
    });
  })
}

const connect = () => {
  connection.query(
    'ALTER TABLE timeline ADD COLUMN diff int default null, ADD COLUMN last_timeline_id int default null, ADD COLUMN elapsed int default null', (err, result) => {
      if(!err){
        connection.query(
          'SELECT * FROM timeline',
          (err, result) => {
            generateDiffRecords(result)
          }
        );
      }else{
        console.error(err)
      }
    })
}

connect();
