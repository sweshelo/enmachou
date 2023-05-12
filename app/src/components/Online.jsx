import React, { useState, useEffect } from "react"
import { config } from "../config"
import "./Ranking.css"
import { useDispatch } from "react-redux"
import actions from "../redux/account/actions.ts"

const User = ({props}) => {
  return(
    <div>
      <a href={props.player_name !== 'プレーヤー' ? `/player/${props.player_name}` : null} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="userinfo-wrapper">
          <p>{props.ranking}位 - {props.point}P @ {new Date(props.created_at).toLocaleTimeString()}</p>
          <h2 className="username">{props.player_name}</h2>
        </div>
      </a>
    </div>
  )
}

const Online = () => {
  const [ rankingData, setRankingData ] = useState([])
  const [ isLoading, setIsLoading ] = useState(true)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({type: actions.TEST})
    const fetchRankingData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/online`, {credentials:'include'})
      const rankingArray = await response.json()
      setRankingData(rankingArray)
      setIsLoading(false)
    }
    fetchRankingData()
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">オンラインのプレイヤー</h2>
        <p className="description">{
          isLoading
            ? `読み込み中です…`
            : `現在 ${rankingData.length}人 がオンラインと推定されます`
          }</p>
        {rankingData.sort((a, b) => (a.updated_at !== b.updated_at) ? a.updated_at < b.updated_at : a.ranking > b.ranking)
            .filter((item, index, array) => {
              return array.findIndex((obj) => obj.player_name === item.player_name) === index;
            })
            .map((r, index) => <User key={index} props={r} />)}
      </div>
    </div>
  )
}

export default Online;
