import {Request, Response} from "express";
import {Connection} from "mysql2/promise";
import {User} from "./types/table";
import bcrypt from 'bcryptjs';
import {Auth, CreateAccountBody} from "./types/request";
import * as jwt from 'jsonwebtoken';
import fs from 'fs';

const status = {
  ok: 'ok',
  error: 'error',
  undefined: 'undefind'
}

class Account {
  connection: Promise<Connection>;
  private privateKey: string;
  private publicKey: string;

  constructor(connection: Promise<Connection>){
    this.connection = connection
    this.privateKey = fs.readFileSync('signkey.pem').toString()
    this.publicKey = fs.readFileSync('publickey.pem').toString()
  }

  throwAuthorizeError(res: Response){
    res.status(401).send({
      status: status.error,
      message: 'ログイン情報が不正です。'
    })
  }

  async createAccount(req: Request<CreateAccountBody>, res: Response){
    try{
      // 既に登録済みかチェック
      const [checkAlreadyExistResult] = await (await this.connection).execute('SELECT * FROM users WHERE user_id = ? OR player_id = ?;', [req.body.userId, req.body.playerId])
      if ((checkAlreadyExistResult as User[]).length > 0) {
        res.send({
          status: status.error,
          message: `あなたが指定したプレイヤーまたはユーザIDは既に使用されています。本人以外の第三者による登録が疑われる場合は、Twitter:@sweshelo Mail:sweshelo@gmail.comまで異議申し立てを行って下さい。`
        })
        return
      }

      // 新規登録
      const passhash = await bcrypt.hash(req.body.password, 10)
      const activationCode = ("00000000" + Math.floor(Math.random() * 99999999).toString()).slice(-8)
      const [createUserAccountResult] = await (await this.connection).query('INSERT INTO users (user_id, player_id, passhash, activation_code) VALUES (?);', [[ req.body.userId, req.body.playerId, passhash, activationCode ]])

      res.send({
        status: status.ok,
        body: {
          activationCode
        }
      })
      return

    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async login(req: Request, res: Response){
    try{
      const [userResult] = await (await this.connection).execute('SELECT * FROM users WHERE user_id = ?;', [req.body.auth.userId])
      if((userResult as []).length === 0 || !await bcrypt.compare(req.body.auth.password, userResult[0].passhash)) {
        this.throwAuthorizeError(res)
      }else{
        const payload = { user: req.body.auth.userId }
        res.send({
          status: status.ok,
          token: jwt.sign(payload, this.privateKey, { algorithm: 'RS256' })
        })
      }
    }catch(e){
      res.send({
        status: status.error,
        message: e.message
      })
    }
  }

  async auth(authObject: Auth){
    const [userResult] = await (await this.connection).execute('SELECT token FROM users WHERE user_id = ?;', [authObject.userId])
    if((userResult as []).length === 0) return false
    return await bcrypt.compare(authObject.token, userResult[0].token)
  }

  // TODO
  async changeSettings(req: Request, res: Response){
    try{
      const decoded = jwt.verify(req.body.auth, this.publicKey)
      const settings = [ req.body.isHideDate, req.body.isHideTime, req.body.onlineThreshold ]
      res.send({
        status: status.ok
      })
    }catch(e){
      res.send({
        status: status.error,
        message: e.message,
        body: req.body
      })
    }
  }
}

export default Account
