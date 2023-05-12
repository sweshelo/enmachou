import React, { useEffect } from "react"
import "./Ranking.css"
import { useDispatch, useSelector } from "react-redux"
import actions from "../redux/records/actions.ts"

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
  const { isLoading, onlinePlayer } = useSelector((state) => state.recordsReducer)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getOnlineUserList())
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">オンラインのプレイヤー</h2>
        <p className="description">{
          isLoading
            ? `読み込み中です…`
            : `現在 ${onlinePlayer?.length}人 がオンラインと推定されます`
          }</p>
        {onlinePlayer?.sort((a, b) => (a.updated_at !== b.updated_at) ? a.updated_at < b.updated_at : a.ranking > b.ranking)
            .filter((item, index, array) => {
              return array.findIndex((obj) => obj.player_name === item.player_name) === index;
            })
            .map((r, index) => <User key={index} props={r} />)}
      </div>
    </div>
  )
}

export default Online;
