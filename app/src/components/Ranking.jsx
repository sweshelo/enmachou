import React, { useState, useEffect } from "react"
import './Ranking.css';

const User = ({props}) => {
  return(
    <div>
      <a href={`/player/${props.user_name}`} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="userinfo-wrapper">
          <p>{props.ranking}位 - {props.point}P</p>
          <h2 className="username">{props.user_name}</h2>
        </div>
      </a>
    </div>
  )
}

const Ranking = () => {
  const [ rankingData, setRankingData ] = useState([])
  useEffect(() => {
    const fetchRankingData = async() => {
      const response = await fetch('https://enmachou.sweshelo.jp/api/ranking')
      const rankingArray = await response.json()
      setRankingData(rankingArray)
    }
    fetchRankingData()
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        {rankingData.map((r, index) => <User key={index} props={r} />)}
      </div>
    </div>
  )
}

export default Ranking;
