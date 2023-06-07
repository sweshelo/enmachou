import { createConnection } from 'mysql2/promise'
import express, {Request, Response} from 'express'
import {AddressInfo} from 'net'
import cookieParser from 'cookie-parser'
import crypto from 'crypto'
import cors from 'cors'
import Record from './record'
import {onlineRequestBody} from './types/request'

const connection = createConnection({
  host: 'mysql',
  user: 'ccj',
  password: 'password',
  database: 'ccj'
});

// ==== Web API ==== //
const app = express();
const server = app.listen(4400, () => console.log("Node.js is listening to PORT:" + (server.address() as AddressInfo).port));
app.use(cors({
  origin: 'http://192.168.1.10:3000',
  credentials: true
}));
app.use(cookieParser())

const generateTracker = (req: Request, res: Response) => {
  const trackerUuid = crypto.randomUUID()
  res.send({
    'status': 'ok',
    'tracker': trackerUuid
  })
}

const record = new Record(connection)

app.get('/api/ranking', (req, res) => {record.getRanking(req, res)})
app.get('/api/max-ranking', (req, res) => {record.getMaxPointRanking(req, res)})
app.get('/api/players/:playername', (req, res) => {record.getPlayerinfo(req, res)})
app.get('/api/players/:playername/prefectures', (req, res) => {record.getPrefectures(req, res)})
app.get('/api/online/:threshold?', (req: Request<onlineRequestBody>, res) => {record.getOnlinePlayers(req, res)})
app.get('/api/stats', (req, res) => {record.statistics(req, res)})
app.post('/api/tracker', (req, res) => {generateTracker(req, res)})
app.post('/api/clean', (req, res) => {record.cleanInvalidRecords(req, res)})

//app.post('/api/user/login', (req, res) => {(login(req, res))})
