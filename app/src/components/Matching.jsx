import React, { useEffect } from "react"
import "./Ranking.css"
import { useDispatch, useSelector } from "react-redux"
import actions from "../redux/records/actions.ts"
import {Player} from "./Player"
import {useParams} from "react-router-dom"

const Matching = () => {
  const { timelineId } = useParams()
  const { matching } = useSelector((state) => state.recordsReducer)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getMatching(timelineId))
  }, [])
  console.log(timelineId)

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">推定マッチング</h2>
        <p className="description">{
          !matching
            ? `読み込み中です…`
            : `ID ${matching.id} の推定マッチング`
          }
        </p>
        {
          matching?.records.sort((a, b) => a.diff < b.diff).map(
            (r, index) => <Player key={index} name={r.player_name} chara={r.chara} header={`${r.diff}P`} isLink={true} />
          )
        }
      </div>
    </div>
  )
}

export default Matching;
