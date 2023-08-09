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
export const hideDetailPlayTime = (datetimeString: string) => {
  const datetime = new Date(datetimeString)
  const month = datetime.getMonth() + 1
  const date = datetime.getDate()
  const dateString = ("00" + month).slice(-2) + "/" + ("00" + date).slice(-2) + " "

  const h = datetime.getHours()
  switch(h){
    case 2:
    case 3:
    case 4:
      return dateString + '未明'
    case 5:
    case 6:
    case 7:
      return dateString + '早朝'
    case 8:
    case 9:
    case 10:
      return dateString + '朝'
    case 11:
    case 12:
    case 13:
      return dateString + '昼'
    case 14:
    case 15:
    case 16:
      return dateString + '午下'
    case 17:
    case 18:
    case 19:
      return dateString + '夕'
    case 20:
    case 21:
    case 22:
      return dateString + '夜'
    case 23:
    case 0:
    case 1:
      return dateString + '深夜'
  }
}

// ステージ特定
export const identifyStage = (targetDate: string) => {
  const schedule = [
    { start: new Date('7/11/2023 10:00'), end: new Date('7/18/2023 9:59'), evenHour: 'ウラオオサカ２', oddHour: 'ウラシブヤ３' },
    { start: new Date('7/18/2023 10:00'), end: new Date('7/25/2023 9:59'), evenHour: 'ウラシブヤ', oddHour: 'ウラオオサカ' },
    { start: new Date('7/25/2023 10:00'), end: new Date('8/1/2023 9:59'), evenHour: 'ウラシブヤ２', oddHour: 'ウラオオサカ２' },
    { start: new Date('8/1/2023 10:00'), end: new Date('8/8/2023 9:59'), evenHour: 'ウラシブヤ３', oddHour: 'ウラシブヤ' },
    { start: new Date('8/8/2023 10:00'), end: new Date('8/15/2023 9:59'), evenHour: 'ウラオキナワ', oddHour: 'ウラオキナワ' },
    { start: new Date('8/15/2023 10:00'), end: new Date('8/22/2023 9:59'), evenHour: 'ウラオキナワ', oddHour: 'ウラオオサカ' },
    { start: new Date('8/22/2023 10:00'), end: new Date('8/29/2023 9:59'), evenHour: 'ウラオキナワ', oddHour: 'ウラシブヤ２' },
    { start: new Date('8/29/2023 10:00'), end: new Date('9/5/2023 9:59'), evenHour: 'ウラオキナワ', oddHour: 'ウラオオサカ２' },
  ]

  const foundRecord = schedule.find(record => new Date(targetDate) >= record.start && new Date(targetDate) <= record.end)
  const isEvenHour = new Date(targetDate).getHours() % 2 === 0
  return foundRecord ? isEvenHour ? foundRecord.evenHour : foundRecord.oddHour : null
}

