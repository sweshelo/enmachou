import * as jwt from 'jsonwebtoken';
import fs from 'fs';

// 全角文字にする
export const toFullWidth = (str: string) => {
  return str.replace(/[A-Za-z0-9]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  }).replace('.', '．');
}

// 半角文字にする
export const toHalfWidth = (str: string) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  }).replace('．', '.').replace('：', ':');
}

// 時間帯フィルタリング
export const datetimeToTimeframe = (datetimeString: string, hideDetailPlayTime: boolean) => {
  const datetime = new Date(datetimeString)

  const h = datetime.getHours()
  if (hideDetailPlayTime) {
    datetime.setHours(0)
    datetime.setMinutes(0)
    datetime.setSeconds(0)
    datetime.setMilliseconds(0)
  }

  switch(h){
    case 2:
    case 3:
    case 4:
      return {
        date: datetime,
        timeframe: '未明'
      }
    case 5:
    case 6:
    case 7:
      return {
        date: datetime,
        timeframe: '早朝'
      }
    case 8:
    case 9:
    case 10:
      return {
        date: datetime,
        timeframe: '朝'
      }
    case 11:
    case 12:
    case 13:
      return {
        date: datetime,
        timeframe: '昼'
      }
    case 14:
    case 15:
    case 16:
      return {
        date: datetime,
        timeframe: '午下'
      }
    case 17:
    case 18:
    case 19:
      return {
        date: datetime,
        timeframe: '夕'
      }
    case 20:
    case 21:
    case 22:
      return {
        date: datetime,
        timeframe: '夜'
      }
    case 23:
    case 0:
    case 1:
      return {
        date: datetime,
        timeframe: '深夜'
      }
  }
}

// ステージ特定
export const identifyStage = (targetDate: string) => {
  const schedule = [
    { start: '7/11/2023 10:00', end: '7/18/2023 9:59', evenHour: 'ウラオオサカ２', oddHour: 'ウラシブヤ３' },
    { start: '7/18/2023 10:00', end: '7/25/2023 9:59', evenHour: 'ウラシブヤ', oddHour: 'ウラオオサカ' },
    { start: '7/25/2023 10:00', end: '8/1/2023 9:59', evenHour: 'ウラシブヤ２', oddHour: 'ウラオオサカ２' },
    { start: '8/1/2023 10:00', end: '8/8/2023 9:59', evenHour: 'ウラシブヤ３', oddHour: 'ウラシブヤ' },
    { start: '8/8/2023 10:00', end: '8/15/2023 9:59', evenHour: 'ウラオキナワ', oddHour: 'ウラオキナワ' },
    { start: '8/15/2023 10:00', end: '8/22/2023 9:59', evenHour: 'ウラオキナワ', oddHour: 'ウラオオサカ' },
    { start: '8/22/2023 10:00', end: '8/29/2023 9:59', evenHour: 'ウラオキナワ', oddHour: 'ウラシブヤ２' },
    { start: '8/29/2023 10:00', end: '9/5/2023 9:59', evenHour: 'ウラオキナワ', oddHour: 'ウラオオサカ２' },
    {
      "start": "2023-12-26T01:00:00.000Z",
      "end": "2024-01-02T00:59:00.000Z",
      "oddHour": "ウラシブヤ３",
      "evenHour": "ウラオオサカ"
    },
    {
      "start": "2024-01-02T01:00:00.000Z",
      "end": "2024-01-09T00:59:00.000Z",
      "oddHour": "ウラオオサカ２",
      "evenHour": "ウラオキナワ"
    },
    {
      "start": "2024-01-09T01:00:00.000Z",
      "end": "2024-01-16T00:59:00.000Z",
      "oddHour": "ウラオキナワ２",
      "evenHour": "ウラシブヤ２"
    },
    {
      "start": "2024-01-16T01:00:00.000Z",
      "end": "2024-01-23T00:59:00.000Z",
      "oddHour": "ウラシブヤ",
      "evenHour": "ウラオオサカ"
    },
    {
      "start": "2023-11-28T01:00:00.000Z",
      "end": "2023-12-05T00:59:00.000Z",
      "oddHour": "ウラオオサカ",
      "evenHour": "ウラオキナワ２"
    },
    {
      "start": "2023-12-05T01:00:00.000Z",
      "end": "2023-12-12T00:59:00.000Z",
      "oddHour": "ウラオキナワ２",
      "evenHour": "ウラオオサカ２"
    },
    {
      "start": "2023-12-12T01:00:00.000Z",
      "end": "2023-12-19T00:59:00.000Z",
      "oddHour": "ウラシブヤ２",
      "evenHour": "ウラオキナワ"
    },
    {
      "start": "2023-12-19T01:00:00.000Z",
      "end": "2023-12-26T00:59:00.000Z",
      "oddHour": "ウラシブヤ",
      "evenHour": "ウラオキナワ２"
    },
    {
      start: "2023-11-14T01:00:00.000Z",
      end: "2023-11-21T00:59:00.000Z",
      oddHour: "ウラオキナワ２",
      evenHour: "ウラオキナワ２"
    },
    {
      start: "2023-11-21T01:00:00.000Z",
      end: "2023-11-28T00:59:00.000Z",
      oddHour: "ウラシブヤ３",
      evenHour: "ウラオキナワ２"
    },
    {
      start: "2023-10-31T01:00:00.000Z",
      end: "2023-11-07T00:59:00.000Z",
      oddHour: "ウラシブヤ（ハロウィンver.）",
      evenHour: "ウラオオサカ２"
    },
    {
      start: "2023-11-07T01:00:00.000Z",
      end: "2023-11-14T00:59:00.000Z",
      oddHour: "ウラオキナワ",
      evenHour: "ウラシブヤ２"
    },
    {
      start: "2023-10-03T01:00:00.000Z",
      end: "2023-10-10T00:59:00.000Z",
      oddHour: "ウラシブヤ",
      evenHour: "ウラオオサカ"
    },
    {
      start: "2023-10-10T01:00:00.000Z",
      end: "2023-10-17T00:59:00.000Z",
      oddHour: "ウラオオサカ２",
      evenHour: "ウラシブヤ２"
    },
    {
      start: "2023-10-17T01:00:00.000Z",
      end: "2023-10-24T00:59:00.000Z",
      oddHour: "ウラオキナワ",
      evenHour: "ウラシブヤ３"
    },
    {
      start: "2023-10-24T01:00:00.000Z",
      end: "2023-10-31T00:59:00.000Z",
      oddHour: "ウラオオサカ",
      evenHour: "ウラシブヤ（ハロウィンver.）"
    },
    {
      start: "2023-09-05T01:00:00.000Z",
      end: "2023-09-12T00:59:00.000Z",
      oddHour: "ウラオオサカ",
      evenHour: "ウラシブヤ３"
    },
    {
      start: "2023-09-12T01:00:00.000Z",
      end: "2023-09-19T00:59:00.000Z",
      oddHour: "ウラオキナワ",
      evenHour: "ウラシブヤ"
    },
    {
      start: "2023-09-19T01:00:00.000Z",
      end: "2023-09-26T00:59:00.000Z",
      oddHour: "ウラシブヤ２",
      evenHour: "ウラオオサカ２"
    },
    {
      start: "2023-09-26T01:00:00.000Z",
      end: "2023-10-03T00:59:00.000Z",
      oddHour: "ウラシブヤ３",
      evenHour: "ウラオキナワ"
    }
  ]

  const foundRecord = schedule.find(record => new Date(targetDate) >= new Date(record.start) && new Date(targetDate) <= new Date(record.end))
  const isEvenHour = new Date(targetDate).getHours() % 2 === 0
  return foundRecord ? isEvenHour ? foundRecord.evenHour : foundRecord.oddHour : null
}


export const auth = (token: string) => {
  const pubkey = fs.readFileSync('publickey.pem').toString()
  return jwt.verify(token, pubkey)
}
