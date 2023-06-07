import {Connection} from 'mysql2/promise'

class Logger{
  static async createLog(tracker: string, endpoint: string, connection: Promise<Connection>){
    const insertIntoLogQuery = "INSERT INTO log (tracker, visit) VALUES (?);";
    await (await connection).query(insertIntoLogQuery, [[tracker, endpoint]])
  }
}

export default Logger
