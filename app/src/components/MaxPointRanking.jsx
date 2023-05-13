import React, { useState, useEffect } from "react"
import {useDispatch, useSelector} from "react-redux";
import actions from "../redux/records/actions.ts";
import './Ranking.css';

const Player = ({props}) => {
  return(
    <div>
      <a href={props.player_name !== 'プレーヤー' ? `/player/${props.player_name}` : null} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="playerinfo-wrapper">
          <p>{props.diff}P - @ {props.created_at}</p>
          <h2 className="playername">{props.player_name}</h2>
        </div>
      </a>
    </div>
  )
}

const MaxPointRanking = () => {
  const ranking = useSelector((state) => state.recordsReducer)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getMaxRankingplayerList())
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">最高貢献ポイントランキング</h2>
        <p className="description-mini">このページでは、高スコアを登録している上位100位までのレコード一覧と、そのレコードを樹立したプレイヤーを確認できます。このランキングには、平均値算出から除外されるレコードは登録されません。</p>
        {ranking?.maxRanking.length > 0
          ? ranking?.maxRanking.map((r, index) => <Player key={index} props={r} />)
          : <p className="description">レコードがありません</p>
        }
      </div>
    </div>
  )
}

export default MaxPointRanking;
