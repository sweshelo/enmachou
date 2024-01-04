import { createConnection } from 'mysql2/promise'
import express, {Request, Response} from 'express'
import {AddressInfo} from 'net'
import cookieParser from 'cookie-parser'
import crypto from 'crypto'
import cors from 'cors'
import Record from './record'
import {CreateAccountBody, OnlineRequestBody} from './types/request'
import Account from './account'
import Presents from './presents'
import { config } from './config'

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
  origin: config.origin,
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())

const generateTracker = (req: Request, res: Response) => {
  const trackerUuid = crypto.randomUUID()
  res.send({
    'status': 'ok',
    'tracker': trackerUuid
  })
}

const record = new Record(connection)
const account = new Account(connection)
const presents = new Presents(connection)

app.get('/api/ranking', (req, res) => record.getRanking(req, res))
app.get('/api/max-ranking', (req, res) => record.getMaxPointRanking(req, res))
app.get('/api/average-ranking', (req, res) => record.getAverageRanking(req, res))
app.get('/api/players/:playername', (req, res) => record.getPlayerinfo(req, res))
app.get('/api/players/:playername/prefectures', (req, res) => record.getPrefectures(req, res))
app.get('/api/online/:threshold?', (req: Request<OnlineRequestBody>, res) => record.getOnlinePlayers(req, res))
app.get('/api/stats', (req, res) => record.statistics(req, res))
app.get('/api/matching/:timelineId', (req, res) => record.getMatching(req, res))
app.get('/api/presents', (req, res) => presents.getPresents(req, res))
app.get('/api/gauge-ranking', (req, res) => record.getEstOniRanker(req, res))

app.post('/api/signup', (req: Request<CreateAccountBody>, res) => account.createAccount(req, res))
app.post('/api/login', (req, res) => {(account.login(req, res))})
app.post('/api/settings', (req: Request, res) => account.changeSettings(req, res))
app.post('/api/miauth', (req, res) => account.miAuth(req, res))
app.post('/api/link-player', (req, res) => account.accountLink(req, res))

app.post('/api/tracker', (req, res) => generateTracker(req, res))
app.post('/api/clean', (req, res) => record.cleanInvalidRecords(req, res))

