import {Connection} from 'mysql2/promise'
import Logger from './logging'
import {Request, Response} from 'express'

const status = {
  ok: 'ok',
  error: 'error',
  undefined: 'undefind'
}

interface PresentItem {
  original_name: string
  identify_name: string
  updated_at: string
  count: number
  remain: number
  diff: number
}

class Presents {
  connection: Promise<Connection>;
  defaultOnlineThreshold: number = 20;

  constructor(connection: Promise<Connection>){
    this.connection = connection
  }

  async getPresents(req: Request, res: Response){
    try{
      if (req.cookies.tracker) Logger.createLog(req.cookies.tracker, req.originalUrl, this.connection)
      const getPresentsHistory = "SELECT * FROM presents;"
      const [ result ] = await (await this.connection).execute(getPresentsHistory)

      if (result && Array.isArray(result) && result.length > 0){
        const formattedData = [];
        const objMap = {};

        for (const item of result) {
          const { original_name, identify_name, count, remain, diff, updated_at } = item as PresentItem;
          if (original_name in objMap) {
            objMap[original_name].history.push({ count, remain, diff, updated_at });
          } else {
            objMap[original_name] = {
              original_name,
              identify_name,
              history: [{ count, remain, diff, updated_at }]
            };
          }
        }
        for (const key in objMap) {
          formattedData.push(objMap[key]);
        }
        res.send({
          status: status.ok,
          body: formattedData
        })
      }else{
        res.send({
          status: status.undefined,
          body: [],
          message: 'データがありません。'
        })
      }
      return
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }
}

export default Presents
