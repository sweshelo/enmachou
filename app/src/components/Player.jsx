import {Link} from "react-router-dom";

// 半角文字にする
const toHalfWidth = (str) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  }).replaceAll('．', '.').replaceAll('：',':');
}

export const Player = ({header, chara, name, isLink}) => {
  return(
    <Link to={name !== 'プレーヤー' && isLink ? `/player/${name}` : null}>
      <div className="player">
        { chara && <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${chara}.png`} /> }
        <div className="playerinfo-wrapper">
          <p>{header}</p>
          <h2 className="playername ccj-font">{toHalfWidth(name)}</h2>
        </div>
      </div>
    </Link>
  )
}
