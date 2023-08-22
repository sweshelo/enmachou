import React, { useState, useEffect } from "react"
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import actions from "../redux/records/actions.ts";
import {Player} from "./Player";
import './Ranking.css';

const AverageRanking = () => {
  const ranking = useSelector((state) => state.recordsReducer)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getAverageRankingPlayerList())
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">平均貢献ポイントランキング</h2>
        <p className="description-mini">このページでは、偏差値50を上回っているプレイヤーと <br />その平均貢献ポイントが確認できます。</p>
        {ranking?.AverageRanking.length > 0
          ? ranking?.AverageRanking.map((r, index) => <Player key={index} header={`${r.effective_average}P : 偏差値 ${r.deviation_value}`} chara={r.chara} name={r.player_name} isLink={true} />)
          : <p className="description">読み込み中…</p>
        }
      </div>
    </div>
  )
}

export default AverageRanking;
