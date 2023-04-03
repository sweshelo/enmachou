const { JSDOM } = require('jsdom')
const fs = require('fs')
const baseUrl = `https://p.eagate.573.jp/game/chase2jokers/ccj/ranking/index.html`

// 「yyyymmdd」形式の日付文字列に変換する関数
function now() {
  const date = new Date();

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const yyyy = y.toString();
  const mm = ("00" + m).slice(-2);
  const dd = ("00" + d).slice(-2);

  const h = date.getHours();
  const min = date.getMinutes();
  const s = date.getSeconds();

  const hh = ("00" + h).slice(-2);
  const mi = ("00" + min).slice(-2);
  const ss = ("00" + s).slice(-2);

  return yyyy + mm + dd + hh + mi + ss;
};

const main = async() => {
  const rankingData = []
  const array = [0, 1, 2, 3]
  const promisses = array.map(index => {
    return fetch(`${baseUrl}?page=${index}&rid=202304`)
      .then(r => r.text())
      .then(r => {
        const dom = new JSDOM(r, 'text/html')
        const document = dom.window.document
        rankingData.push([...document.querySelector('#ranking_data').children].slice(1, 26).map(data => {
          return({
            'rank': parseInt(data.querySelector('div').textContent),
            'chara': data.querySelector('img').src,
            'achievement': [...data.querySelectorAll('div')][1].querySelector('span').textContent,
            'player': [...data.querySelectorAll('div')][1].querySelectorAll('p')[1].childNodes[1].textContent,
            'point': parseInt([...data.querySelectorAll('div')][2].childNodes[0].textContent),
          })
        }))
      })
  })

  await Promise.all(promisses)
  fs.writeFileSync(`${now()}.json`, JSON.stringify(rankingData.sort((a, b) => (a.rank > b.rank))));
}

main()
