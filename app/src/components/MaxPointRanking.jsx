import React, { useState, useEffect } from "react"
import { config } from "../config"
import './Ranking.css';

const User = ({props}) => {
  return(
    <div>
      <a href={props.user_name !== 'プレーヤー' ? `/player/${props.user_name}` : null} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="userinfo-wrapper">
          <p>{props.diff}P - @ {new Date(props.created_at).toLocaleString('ja-JP')}</p>
          <h2 className="username">{props.user_name}</h2>
        </div>
      </a>
    </div>
  )
}

const MaxPointRanking = () => {
  const [ rankingData, setRankingData ] = useState([])
  useEffect(() => {
    const fetchRankingData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/max-ranking`)
      const rankingArray = await response.json()
      setRankingData(rankingArray)
    }
    fetchRankingData()
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">最高貢献ポイントランキング</h2>
        {rankingData.map((r, index) => <User key={index} props={r} />)}
      </div>
    </div>
  )
}

export default MaxPointRanking;
