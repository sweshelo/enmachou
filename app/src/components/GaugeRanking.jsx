import React, { useState, useEffect } from "react"
import {useDispatch, useSelector} from "react-redux";
import actions from "../redux/records/actions.ts";
import {Player} from "./Player";
import './Ranking.css';

const GaugeRanking = () => {
  const dispatch = useDispatch()
  const { gaugeRanking } = useSelector(state => state.recordsReducer)

  useEffect(() => {
    dispatch(actions.getRankingPlayerList())
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">推定鬼ランクプレイヤー</h2>
        <p className='description medium'>
        ランキングデータを公表しているプレイヤーのうち最もランクゲージの高いプレイヤー4人です<br />
        </p>
        {gaugeRanking?.players.slice(0, 4).map((r, index) => <Player key={index} name={r.player_name} chara={r.chara} header={`${index + 1}位 - ${r.gauge} @ ${new Date(r.updated_at).toLocaleDateString('sv-SW').replaceAll('-', '/')}`} isLink={true}/>)}
        <h2 className="page-title rainbow-grad-back">鬼ランク候補</h2>
        <p className='description medium'>
        ランキングデータを公表しているプレイヤーのうち鬼に次いでランクゲージの高いプレイヤー10人です<br />
        </p>
        {gaugeRanking?.players.slice(4).filter((r) => r.gauge > 100).slice(0, 10).map((r, index) => <Player key={index} name={r.player_name} chara={r.chara} header={`${index + 5}位 - ${r.gauge} @ ${new Date(r.updated_at).toLocaleDateString('sv-SW').replaceAll('-', '/')}`} isLink={true}/>)}
      </div>
    </div>
  )
}

export default GaugeRanking;
