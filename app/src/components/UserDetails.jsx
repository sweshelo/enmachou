import React, { useState, useEffect } from "react"
import { useRoutes, useParams } from 'react-router-dom';
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
    <div className="achievement">
      <span>{title}</span>
    </div>
  )
}

const DetailBoard = (props) => {
  return(
    <div className="report">
      <div className="stats-block block-l">
        <p className="stats-key">瞬間最高ランキング</p>
        <p className="stats-value">{props.ranking}位</p>
      </div>
      <div className="stats-block block-r">
        <p className="stats-key">最高貢献ポイント</p>
        <p className="stats-value">{props.point || 'データなし'}</p>
      </div>
      <div className="stats-block block-l">
        <p className="stats-key">平均貢献ポイント</p>
        <p className="stats-value">{props.average?.toFixed(3) || 'データなし'}</p>
      </div>
    </div>
  )
}

const PlayLog = (props) => {
  console.log(props)
  return props.log?.length > 1 ? (
    <div className="playlog">
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
          props.log.slice(1).map((log, index) => {
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

const UserDetails = ({props}) => {
  const [ userDetailData, setUserDetailData ] = useState({})
  const { username } = useParams();
  useEffect(() => {
    const fetchUserDetailData = async() => {
      const response = await fetch(`https://enma.sweshelo.jp/api/users/${username}`)
      const rankingArray = await response.json()
      setUserDetailData(rankingArray)
    }
    fetchUserDetailData()
  }, [])

  return (
    <div id="user-detail-wrapper">
      <div className="user-detail">
        <Achievement title={userDetailData.achievement} />
        <div className="player">
          <img className="character" src={userDetailData ? `https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${userDetailData.chara}.png` : ''} />
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
