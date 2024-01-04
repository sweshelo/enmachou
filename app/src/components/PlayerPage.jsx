import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import { Link, useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import actions from '../redux/records/actions.ts';
import Map from './Map';
import './PlayerPage.css';
import { BiHide } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { BsQuestionCircle, BsYoutube } from 'react-icons/bs';
import { GiBattleAxe } from 'react-icons/gi';
import { TbPresentationAnalytics } from 'react-icons/tb';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Player } from './Player';
import { Spin } from 'antd';

export const OnlineIndicator = ({ online }) => {
  return (
    <div className={`online-status ${online ? 'online' : 'offline'}`}>
      <span>{online ? 'online' : 'offline'}</span>
    </div>
  )
}

export const Achievement = ({ title }) => {
  return (
    <div className="achievement gray-grad-back">
      <span>{title}</span>
    </div>
  )
}

export const DetailBoard = (props) => {
  const tooltipStyle = {
    maxWidth: 'calc(100% - 10px)',
    padding: '8px 5px',
  }

  const TooltipHTML = (element) => ReactDOMServer.renderToStaticMarkup(element)

  return (
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
          <p className="stats-key">有効平均貢献P <BsQuestionCircle id='effective-average' data-tooltip-html={TooltipHTML(<div>直近110件のプレイのうち、最高/最低5件を除く貢献度の平均値です<br />登録レコードが110件未満の場合は「データなし」となります</div>)} /></p>
          <p className="stats-value">{props.effectiveAverage || 'データなし'}</p>
          <ReactTooltip
            anchorId='effective-average'
            place='top'
            style={tooltipStyle}
          />
        </div>
        <div className="stats-block">
          <p className="stats-key">自己標準偏差 <BsQuestionCircle id='standard-deviation' data-tooltip-html={TooltipHTML(<div>プレイヤーの獲得貢献度の偏差です<br />この値が大きいほど貢献度にばらつきがあります</div>)} /></p>
          <p className="stats-value">{props.standardDeviation?.toFixed(3) || 'データなし'}</p>
          <ReactTooltip
            anchorId='standard-deviation'
            place='top'
            style={tooltipStyle}
          />
        </div>
        <div className="stats-block">
          <p className="stats-key">全国偏差値 <BsQuestionCircle id='deviation-value' data-tooltip-html={TooltipHTML(<div>プレイヤーの有効平均貢献度から算出された偏差値です<br />この値が50に近いほど平均に近づきます</div>)} /></p>
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

const stageInfo = (name) => {
  switch (name) {
    case 'ウラシブヤ': return { name: 'シブヤ1', color: 'normal' }
    case 'ウラシブヤ２': return { name: 'シブヤ2', color: 'normal' }
    case 'ウラシブヤ３': return { name: 'シブヤ3', color: 'normal' }
    case 'ウラシブヤ（ハロウィンver.）': return { name: 'ハロシブ', color: 'event' }
    case 'ウラオオサカ': return { name: 'オオサカ1', color: 'normal' }
    case 'ウラオオサカ２': return { name: 'オオサカ2', color: 'normal' }
    case 'ウラオキナワ': return { name: 'オキナワ1', color: 'normal' }
    case 'ウラオキナワ２': return { name: 'オキナワ2', color: 'normal' }
  }
}

export const PlayLog = (props) => {
  const [isLimit10, setLimit10] = useState(true)
  const [focusRecord, setFocusRecord] = useState(null)

  const StageMark = ({ stage }) => {
    const { name, color } = stageInfo(stage)
    return (
      <span className={`stage-mark-${color}`}>
        {name}
      </span>
    )
  }

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
            props.log.sort((a, b) => a.timeline_id < b.timeline_id).slice(0, (isLimit10 ? 10 : props.log.length)).map((log, index) => {
              const date = props.isHiddenDate ? null : new Date(log.datetime.date)
              const displayDate = props.isHiddenDate ? '非表示' : `${date.getMonth() + 1}/${date.getDate()}`
              const displayTime = props.isHiddenDate ? '' : props.isHiddenTime ? log.datetime.timeframe : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
              return (
                <>
                  <tr
                    key={`timeline-${index}`}
                    className={`${(log.elapsed >= 600 || log.diff === null) ? 'invalid-record' : ''} ${(focusRecord == log.timeline_id) ? 'focus-record' : ''}`}
                    onClick={() => {
                      setFocusRecord(focusRecord === log.timeline_id ? null : log.timeline_id)
                    }}
                  >
                    <td className="datetime">{`${displayDate} ${displayTime}`}{log.stage && <StageMark stage={log.stage} />}</td>
                    <td className="point">{log.point}P</td>
                    <td className="diff">+{log.diff}</td>
                  </tr>
                  {focusRecord === log.timeline_id && (
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
                            <Link to={`/matching/${log.timeline_id}`}><GiBattleAxe /> 推定マッチング</Link>
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

export const PlayLogForGuage = (props) => {
  const [isLimit10, setLimit10] = useState(true)
  const [focusRecord, setFocusRecord] = useState(null)
  const { gaugeRanking } = useSelector((state) => state.recordsReducer)

  const StageMark = ({ stage }) => {
    const { name, color } = stageInfo(stage)
    return (
      <span className={`stage-mark-${color}`}>
        {name}
      </span>
    )
  }

  return props.log?.length > 0 ? (
    <div className="playlog">
      <p
        className="title-paragraph"
        onClick={() => setLimit10(!isLimit10)}
      >{`${isLimit10 ? '直近10件' : '全て'}のランクゲージ変動履歴`}</p>
      <p className='description medium'>
        {props.log[0].diff - 1300 >= gaugeRanking.border
          ? '推定ボーターより上です'
          : <>
            推定ボーターより下です <br />
            ボーダー {gaugeRanking.border} : 到達まで あと {gaugeRanking.border - (props.log[0].diff - 1300)} 必要です
          </>
        }
      </p>
      <table>
        <thead>
          <tr>
            <th className="datetime">日時</th>
            <th className="point">キャラ</th>
            <th className="diff">推定</th>
            <th className="diff">変動</th>
          </tr>
        </thead>
        <tbody>
          {
            props.log.sort((a, b) => a.timeline_id < b.timeline_id).slice(0, (isLimit10 ? 10 : props.log.length)).map((log, index) => {
              const date = props.isHiddenDate ? null : new Date(log.datetime.date)
              const displayDate = props.isHiddenDate ? '非表示' : `${date.getMonth() + 1}/${date.getDate()}`
              const displayTime = props.isHiddenDate ? '' : props.isHiddenTime ? log.datetime.timeframe : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
              const gaugeDiff = index === props.log.length - 1 ? null : log.diff - props.log[index + 1].diff
              const gaugeDiffText = gaugeDiff > 0 ? `+${gaugeDiff}` : gaugeDiff < 0 ? `${gaugeDiff}` : `±0`
              return (
                <>
                  <tr
                    key={`timeline-${index}`}
                    className={`${(Math.abs(gaugeDiff) > 30) ? 'invalid-record' : ''} ${(focusRecord == log.timeline_id) ? 'focus-record' : ''}`}
                    onClick={() => {
                      setFocusRecord(focusRecord === log.timeline_id ? null : log.timeline_id)
                    }}
                  >
                    <td className="datetime">{`${displayDate} ${displayTime}`}{log.stage && <StageMark stage={log.stage} />}</td>
                    <td style={{ margin: 0, padding: 0 }}><img height={35} src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${log.chara}.png`}/></td>
                    <td className="diff">{log.diff - 1300}</td>
                    <td className="diff">{gaugeDiffText}</td>
                  </tr>
                  {focusRecord === log.timeline_id && (
                    <tr>
                      <td colSpan={4} className='record-operation'>
                        <ul>
                          <li className='button-record-operation'>
                            <Link to={`/matching/${log.timeline_id}`}><GiBattleAxe /> 推定マッチング</Link>
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

export const AverageGraph = (props) => {
  const [average, setAverage] = useState([])
  useEffect(() => {
    const calc = {}
    props.log.filter((r) => !r.exception).forEach((r) => {
      if (r.elapsed > 600) return
      const date = new Date(r.datetime.date)
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`
      if (!calc[dateKey]) {
        calc[dateKey] = {
          date: dateKey,
          sum: 0,
          max: r.diff,
          count: 0
        }
      }
      if (calc[dateKey].max < r.diff) calc[dateKey].max = r.diff
      calc[dateKey].sum += r.diff
      calc[dateKey].count++
    })
    setAverage(Object.values(calc).map((r) => ({ ...r, ave: r.sum / r.count })))
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
          <XAxis dataKey="date" fontSize={10} height={15} />
          <YAxis min={50} width={5} fontSize={10} domain={[50, 'dataMax']} />
          <Tooltip formatter={(value) => value.toFixed(2)} />
          <ReferenceLine y={props.average} stroke="red" />
          <Legend />
          <Line type="monotone" dataKey="ave" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="max" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  )
}

const PlayerPage = () => {
  const { playerDetails } = useSelector((state) => state.recordsReducer)
  const { playername } = useParams()
  const playerDetail = playerDetails[playername]
  const dispatch = useDispatch()
  useEffect(() => {
    playerDetail || dispatch(actions.getPlayerDetail(playername))
  }, [dispatch])

  const PrefectureMap = useMemo(() => {
    return playerDetail?.prefectures.length > 0 && (
      <div id="prefectures">
        <p className="title-paragraph">このユーザの制県度</p>
        <Map visited={[...playerDetail?.prefectures]} />
      </div>
    )
  }, [playerDetail, dispatch])

  const pointDiffArray = playerDetail?.log?.map(r => r.elapsed < 600 ? r.diff : null).filter(r => r > 0) || [];
  const pointAfter0506DiffArray = playerDetail?.log?.map(r => r.elapsed < 600 && new Date(r.datetime?.date) >= new Date('2023-05-06 00:00:00') ? r.diff : null)
    .filter(r => r > 0) || [];
  const standardAverage = (pointDiffArray.reduce((x, y) => x + y, 0) / pointDiffArray.length)

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
            <p className='description'><Link to={`/player/detail/${playerDetail?.player_name}`} className='link'><TbPresentationAnalytics /> もっと詳しく見る</Link></p>
          </div>
          <div id="table-wrapper">
            <div style={{ width: '100%' }}>
              <PlayLogForGuage log={playerDetail?.rankgauge_log || []} isHiddenDate={playerDetail?.isHiddenDate} isHiddenTime={playerDetail.isHiddenTime} />
              {!playerDetail.isHiddenDate && <AverageGraph log={playerDetail?.log?.slice(-300) || []} average={playerDetail?.effective_average} />}
              <PlayLog log={playerDetail?.log || []} isHiddenDate={playerDetail?.isHiddenDate} isHiddenTime={playerDetail.isHiddenTime} />
            </div>
          </div>
          {PrefectureMap}
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

export default PlayerPage
