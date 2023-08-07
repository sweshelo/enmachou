import React, { useEffect } from "react"
import "./Ranking.css"
import { useDispatch, useSelector } from "react-redux"
import actions from "../redux/records/actions.ts"
import {Player} from "./Player"

const Online = () => {
  const { isLoading, onlinePlayer } = useSelector((state) => state.recordsReducer)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getOnlinePlayerList())
  }, [])

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">オンラインのプレイヤー</h2>
        <p className="description">
          【重要なお知らせ】<br/>
          <span className="mini-script" >フォントの配信が有料であることや、負荷の低減を主目的として、閻魔帳は来るv1.0のアップデートより、『オンラインのプレイヤー』確認機能を含む幾つかの機能についてMisskeyアカウントが必須となります。認証のために<a href="https://misskey.sweshelo.jp/@enma">@enma@misskey.sweshelo.jp</a>のフォローが必要です。どのサーバのアカウントでもご利用いただけますが、<a href="https://misskey.sweshelo.jp">閻魔帳 Misskey支部</a>のサーバも用意しています。</span>
        </p>
        <p className="description">{
          isLoading
            ? `読み込み中です…`
            : `現在 ${onlinePlayer?.length}人 がオンラインと推定されます`
          }</p>
        {onlinePlayer?.sort((a, b) => (a.updated_at !== b.updated_at) ? a.updated_at > b.updated_at : a.ranking > b.ranking)
            .filter((item, index, array) => {
              return array.findIndex((obj) => obj.player_name === item.player_name) === index;
            })
            .map((r, index) => <Player key={index} name={r.player_name} chara={r.chara} header={`${r.ranking}位 - ${r.point}P @ ${new Date(r.created_at).toLocaleTimeString()}`} isLink={true} />)}
      </div>
    </div>
  )
}

export default Online;
