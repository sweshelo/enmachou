import React, { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { config } from '../config'
import Map from "./Map";
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
      </div>
    </div>
  )
}

const PlayLog = (props) => {
  const [ isLimit10, setLimit10 ] = useState(true)
  return props.log?.length > 0 ? (
    <div className="playlog">
      <p
        className="title-paragraph"
        onClick={() => setLimit10(!isLimit10)}
      >{`${isLimit10 ? '直近10件' : 'すべて'}のプレイ履歴`}</p>
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
            props.log.slice(0, (isLimit10 ? 10 : props.log.length)).map((log, index) => {
              return(
                <tr key={`timeline-${index}`} className={(log.elapsed >= 600 || log.diff === null) && 'invalid-record'}>
                  <td className="datetime">{log.created_at}</td>
                  <td className="point">{log.point}P</td>
                  <td className="diff">+{log.diff}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  ) : null
}

const AverageGraph = (props) => {
  const [ average, setAverage ] = useState([])
  useEffect(() => {
    const calc = {}
    props.log.forEach((r) => {
      if(r.elapsed > 600) return
      const date = r.created_at.split(' ')[0]
      if(!calc[date]){
        calc[date] = {
          date,
          sum: 0,
          max: r.diff,
          count: 0
        }
      }
      if(calc[date].max < r.diff) calc[date].max = r.diff
      calc[date].sum += r.diff
      calc[date].count++
    })
    setAverage(Object.values(calc).reverse().map((r) => ({...r, ave: r.sum / r.count})))
  }, [props?.log])

  return (
    <div className="playlog">
      <p className="title-paragraph">貢献度の推移</p>
        <LineChart
          width={350}
          height={300}
          data={average}
          margin={{
            top: 15,
            right: 25,
            left: 25,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="date" fontSize={10} height={15}/>
          <YAxis min={50} width={5} fontSize={10} domain={[50, 'dataMax']}/>
          <Tooltip formatter={(value) => value.toFixed(2)}/>
          <Legend />
          <Line type="monotone" dataKey="ave" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="max" stroke="#82ca9d" />
        </LineChart>
    </div>
  )
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

  const pointDiffArray = userDetailData.log?.map( r => r.elapsed < 600 ? r.diff : null).filter(r => r > 0) || [];
  const pointAfter0505DiffArray = userDetailData.log?.map( r => r.elapsed < 600 && new Date(r.created_at) > new Date('2023-05-05 00:00:00') ? r.diff : null).filter(r => r > 0) || [];
  const sliceIndexCount = Math.ceil(pointAfter0505DiffArray.length * 0.1)

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
            point={!pointAfter0505DiffArray.length ? null : Math.max(...pointAfter0505DiffArray)}
            average={
              (pointDiffArray.reduce((x, y) => x + y, 0) / pointDiffArray.length) || null
            }
            availAverage={
              pointAfter0505DiffArray.length >= 10
                ? pointAfter0505DiffArray.sort((a, b) => a > b).slice( sliceIndexCount, sliceIndexCount * -1 ).reduce((x, y) => x + y) / (pointAfter0505DiffArray.length - sliceIndexCount * 2)
                : null
            }
          />
        </div>
        <div id="table-wrapper">
          <div>
            <AverageGraph log={userDetailData.log?.slice(-300) || []}/>
            <PlayLog log={userDetailData.log || []} />
          </div>
        </div>
        <div id="prefectures">
          <p className="title-paragraph">このユーザの制県度</p>
          <Map />
        </div>
      </div>
    </div>
  )

}

export default UserDetails
