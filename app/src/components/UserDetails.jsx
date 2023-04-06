import React, { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import { config } from '../config'
import './UserDetails.css'

const OnlineIndicator = ({online}) => {
  return(
    <div className={`online-status ${online ? 'online' : 'offline'}`}>
      <span>{online ? 'online' : 'offline'}</span>
    </div>
  )
}

const Achievement = ({title}) => {
  return(
    <div className="achievement gray-grad-back">
      <span>{title}</span>
    </div>
  )
}

const DetailBoard = (props) => {
  return(
    <div className="report">
      <div className="float-reset">
        <div className="stats-block block-l">
          <p className="stats-key">瞬間最高ランキング</p>
          <p className="stats-value">{props.ranking}位</p>
        </div>
        <div className="stats-block block-r">
          <p className="stats-key">最高貢献ポイント</p>
          <p className="stats-value">{props.point || 'データなし'}</p>
        </div>
      </div>
      <div className="float-reset">
        <div className="stats-block block-l">
          <p className="stats-key">平均貢献ポイント</p>
          <p className="stats-value">{props.average?.toFixed(3) || 'データなし'}</p>
        </div>
        <div className="stats-block block-r beta-feature">
          <p className="stats-key">有効平均貢献ポイント</p>
          <p className="stats-value">{props.availAverage?.toFixed(3) || 'データなし'}</p>
        </div>
      </div>
      <div className="float-reset">
        <p className="mini-script">有効平均貢献ポイントは下限・上限の外れ値10%を除外して算出されます。</p>
        <p className="mini-script">このパラメータは閻魔帳における獲得ポイントが推定値によるために設けられています。</p>
      </div>
    </div>
  )
}

const PlayLog = (props) => {
  return props.log?.length > 1 ? (
    <div className="playlog">
      <p>直近10件のプレイ履歴</p>
      <table>
        <thead>
          <tr>
            <th className="datetime">日時</th>
            <th className="point">累計貢献P</th>
            <th className="diff">推定獲得P</th>
          </tr>
        </thead>
        <tbody>
          {
            props.log.slice(0, -1).slice(0, 10).map((log, index) => {
              return(
                <tr key={`timeline-${index}`}>
                  <td className="datetime">{new Date(log.created_at).toLocaleString('ja-JP')}</td>
                  <td className="point">{log.point}P</td>
                  <td className="diff">+{props.point[index]}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  ) : null
}

const UserDetails = () => {
  const [ userDetailData, setUserDetailData ] = useState({})
  const { username } = useParams();
  useEffect(() => {
    const fetchUserDetailData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/users/${username}`)
      const rankingArray = await response.json()
      setUserDetailData(rankingArray)
    }
    fetchUserDetailData()
  }, [])

  const sliceIndexCount = Math.ceil(userDetailData.diff?.length * 0.1)

  return (
    <div id="user-detail-wrapper">
      <div className="user-detail">
        <Achievement title={userDetailData.achievement} />
        <div className="player">
          { userDetailData.chara && <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${userDetailData.chara}.png`} /> }
          <div className="userinfo-wrapper">
            <p>{userDetailData.ranking}位 - {userDetailData.point}P</p>
            <h2 className="username">{userDetailData.user_name}</h2>
          </div>
        </div>
        <div className="info">
          <OnlineIndicator online={userDetailData?.online} />
          <DetailBoard
            ranking={!userDetailData.log?.length ? null : Math.min(...userDetailData.log.map(r => r.ranking))}
            point={!userDetailData.diff?.length ? null : Math.max(...userDetailData.diff)}
            average={userDetailData.average}
            availAverage={
              userDetailData.diff?.length >= 10
                ? [...userDetailData.diff].sort((a, b) => a > b).slice( sliceIndexCount, sliceIndexCount * -1 ).reduce((x, y) => x + y) / (userDetailData.diff.length - sliceIndexCount * 2)
                : null
            }
          />
        </div>
        <div id="table-wrapper">
          <PlayLog log={userDetailData.log || []} point={userDetailData.diff || []} />
        </div>
      </div>
    </div>
  )

}

export default UserDetails
