import React, { useState, useEffect } from "react"
import { config } from "../config"
import './Ranking.css';

const User = ({props}) => {
  return(
    <div>
      <a href={props.player_name !== 'プレーヤー' ? `/player/${props.player_name}` : null} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="userinfo-wrapper">
          <p>{props.diff}P - @ {props.created_at}</p>
          <h2 className="username">{props.player_name}</h2>
        </div>
      </a>
    </div>
  )
}

const MaxPointRanking = () => {
  const [ rankingData, setRankingData ] = useState([])
  useEffect(() => {
    const fetchRankingData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/max-ranking`, {credentials:'include'})
      const rankingArray = await response.json()
      setRankingData(rankingArray)
    }
    fetchRankingData()
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">最高貢献ポイントランキング</h2>
        <p className="description-mini">このページでは、高スコアを登録している上位100位までのレコード一覧と、そのレコードを樹立したプレイヤーを確認できます。このランキングには、平均値算出から除外されるレコードは登録されません。</p>
        {rankingData.length > 0
          ? rankingData.map((r, index) => <User key={index} props={r} />)
          : <>レコードがありません</>
        }
      </div>
    </div>
  )
}

export default MaxPointRanking;
