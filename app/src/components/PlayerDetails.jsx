import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import actions from '../redux/records/actions.ts';
import Map from './Map';
import './PlayerDetails.css';
import { BiHide } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { BsQuestionCircle, BsYoutube } from 'react-icons/bs';
import { GiBattleAxe } from 'react-icons/gi';
import { Tooltip as ReactTooltip } from "react-tooltip";
import {Player} from './Player';
import { Spin } from 'antd';

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
  const tooltipStyle = {
    maxWidth: 'calc(100% - 10px)',
    padding: '8px 5px',
  }

  const TooltipHTML = (element) => ReactDOMServer.renderToStaticMarkup(element)

  return(
    <div className="report">
      <div className="float-reset">
        <div className="stats-block">
          <p className="stats-key">瞬間最高Rkg.</p>
          <p className="stats-value">{props.ranking}位</p>
        </div>
        <div className="stats-block">
          <p className="stats-key">最高貢献P</p>
          <p className="stats-value">{props.point || 'データなし'}</p>
        </div>
        <div className="stats-block">
          <p className="stats-key">平均貢献P</p>
          <p className="stats-value">{props.average?.toFixed(3) || 'データなし'}</p>
        </div>
      </div>
      <div className="float-reset">
        <div className="stats-block">
          <p className="stats-key">有効平均貢献P <BsQuestionCircle id='effective-average' data-tooltip-html={TooltipHTML(<div>直近110件のプレイのうち、最高/最低5件を除く貢献度の平均値です<br />登録レコードが110件未満の場合は「データなし」となります</div>)}/></p>
          <p className="stats-value">{props.effectiveAverage || 'データなし'}</p>
          <ReactTooltip
            anchorId='effective-average'
            place='top'
            style={tooltipStyle}
          />
        </div>
        <div className="stats-block">
          <p className="stats-key">自己標準偏差 <BsQuestionCircle id='standard-deviation' data-tooltip-html={TooltipHTML(<div>プレイヤーの獲得貢献度の偏差です<br />この値が大きいほど貢献度にばらつきがあります</div>)}/></p>
          <p className="stats-value">{props.standardDeviation?.toFixed(3) || 'データなし'}</p>
          <ReactTooltip
            anchorId='standard-deviation'
            place='top'
            style={tooltipStyle}
          />
        </div>
        <div className="stats-block">
          <p className="stats-key">全国偏差値 <BsQuestionCircle id='deviation-value' data-tooltip-html={TooltipHTML(<div>プレイヤーの有効平均貢献度から算出された偏差値です<br />この値が50に近いほど平均に近づきます</div>)}/></p>
          <p className="stats-value">{props.deviationValue || 'データなし'}</p>
          <ReactTooltip
            anchorId='deviation-value'
            place='top'
            style={tooltipStyle}
          />
        </div>
      </div>
    </div>
  )
}

const PlayLog = (props) => {
  const [ isLimit10, setLimit10 ] = useState(true)
  const [ focusRecord, setFocusRecord ] = useState(null)
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
                <>
                  <tr
                    key={`timeline-${index}`}
                    className={`${(log.elapsed >= 600 || log.diff === null) ? 'invalid-record' : ''} ${(focusRecord == log.timeline_id) ? 'focus-record' : ''}`}
                    onClick={()=>{
                      setFocusRecord(focusRecord === log.timeline_id ? null : log.timeline_id)
                    }}
                  >
                    <td className="datetime">{log.created_at}</td>
                    <td className="point">{log.point}P</td>
                    <td className="diff">+{log.diff}</td>
                  </tr>
                  { focusRecord === log.timeline_id && (
                    <tr>
                      <td colSpan={3} className='record-operation'>
                        <ul>
                          {/*
                          <li className='button-record-operation'>
                            <button><BiHide/> 記録を非表示</button>
                          </li>
                          <li className='button-record-operation'>
                            <button><MdDeleteForever/> 記録を削除</button>
                          </li>
                          <li className='button-record-operation'>
                            <button><BsYoutube/> 動画を紐付け</button>
                          </li>
                          */}
                          <li className='button-record-operation'>
                            <a href={`/matching/${log.timeline_id}`}><GiBattleAxe/> 推定マッチング</a>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
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
      <div className='centerize'>
        <LineChart
          id='chart'
          width={Math.min(window.innerWidth - 20, 600)}
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
    </div>
  )
}

const PlayerDetails = () => {
  const { playerDetail } = useSelector((state) => state.recordsReducer)
  const { playername } = useParams()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getPlayerDetail(playername))
  }, [])

  const pointDiffArray = playerDetail?.log?.map( r => r.elapsed < 600 ? r.diff : null).filter(r => r > 0) || [];
  const pointAfter0506DiffArray = playerDetail?.log?.map(r => r.elapsed < 600 && new Date('2023/' + r.created_at.split(' ')[0]) >= new Date('2023-05-06 00:00:00') ? r.diff : null)
    .filter(r => r > 0) || [];
  const standardAverage = (pointDiffArray.reduce((x, y) => x + y, 0) / pointDiffArray.length)
  console.log(pointAfter0506DiffArray)

  return (
    <div id="player-detail-wrapper">
      {playerDetail ? (
        <div className="player-detail">
          <Achievement title={playerDetail?.achievement} />
          {playerDetail && <Player name={playerDetail.player_name} header={`${playerDetail.ranking}位 - ${playerDetail.point}P`} chara={playerDetail.chara} />}
          <div className="info">
            <OnlineIndicator online={playerDetail?.online} />
            <DetailBoard
              ranking={!playerDetail?.log?.length ? null : Math.min(...playerDetail?.log.map(r => r.ranking))}
              point={!pointAfter0506DiffArray.length ? null : Math.max(...pointAfter0506DiffArray)}
              average={
                standardAverage || null
              }
              effectiveAverage={playerDetail?.effective_average}
              standardDeviation={
                Math.sqrt(
                pointDiffArray.map(val => Math.pow(val - standardAverage, 2)).reduce((acc, val) => acc + val, 0) / pointDiffArray.length
              )
              }
              deviationValue={playerDetail?.deviation_value}
            />
          </div>
          <div id="table-wrapper">
            <div>
              <AverageGraph log={playerDetail?.log?.slice(0, 300) || []}/>
              <PlayLog log={playerDetail?.log || []} />
            </div>
          </div>
          { playerDetail?.prefectures.length > 0 && (
            <div id="prefectures">
              <p className="title-paragraph">このユーザの制県度</p>
              <Map visited={[...playerDetail?.prefectures]} />
            </div>
          ) }
        </div>
      ) : (
        <>
          <p style={{
            position: 'absolute',
            top: '50vh',
            }}>
            <Spin /> 読み込み中…
          </p>
        </>
      )}
    </div>
  )

}

export default PlayerDetails
