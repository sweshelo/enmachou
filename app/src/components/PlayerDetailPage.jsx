import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import { Link, useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import actions from '../redux/records/actions.ts';
import Map from './Map';
import './PlayerPage.css';
import { BiHide } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { BsQuestionCircle, BsYoutube } from 'react-icons/bs';
import { GiBattleAxe } from 'react-icons/gi';
import { TbPresentationAnalytics } from 'react-icons/tb';
import { Tooltip as ReactTooltip } from "react-tooltip";
import {Player} from './Player';
import { Spin } from 'antd';
import {TimeframeChart} from './Statistics';
import {Achievement, AverageGraph, DetailBoard, OnlineIndicator, PlayLog} from './PlayerPage';

const StagePieCharts = ({data, log, toolTipFunc}) => {
  const COLORS = ['#0088FE', '#55AAFF', '#00C49F', '#FFBB28', '#FF8042', '#F05040',];
  return(
    <PieChart width={Math.min(window.innerWidth - 20, 600)} height={160}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={60}
        fill="#8884d8"
        dataKey="value"
        startAngle={90}
        endAngle={-270}
      >
        {log.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={entry.stage} />
        ))}
      </Pie>
      <Tooltip formatter={toolTipFunc} />
      <Legend height={'16px'} layout={'vertical'} align={'right'} verticalAlign={'top'} wrapperStyle={{fontSize: '12px'}} />
    </PieChart>
  )
}

const PlayerDetailPage = () => {
  const { playerDetails } = useSelector((state) => state.recordsReducer)
  const { playername } = useParams()
  const playerDetail = playerDetails[playername]
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getPlayerDetail(playername))
  }, [])

  const pointDiffArray = playerDetail?.log?.map( r => r.elapsed < 600 ? r.diff : null).filter(r => r > 0) || [];
  const pointAfter0506DiffArray = playerDetail?.log?.map(r => r.elapsed < 600 && new Date(r.datetime.date) >= new Date('2023-05-06 00:00:00') ? r.diff : null)
    .filter(r => r > 0) || [];
  const standardAverage = (pointDiffArray.reduce((x, y) => x + y, 0) / pointDiffArray.length)

  const DetailEachStage = () => {
    // Logをステージ毎のObjectに変換
    const eachStageLog = playerDetail?.log?.reduce((acc, item) => {
      if (item.elapsed < 600 && item.stage){
        const existingStage = acc.find(stageObj => stageObj.stage === item.stage);
        if (existingStage) {
          existingStage.records.push(item);
        } else {
          acc.push({ stage: item.stage, records: [item] });
        }
      }
      return acc;
    }, []);
    return(
      <>
        <p className='title-paragraph'>ステージ別プレイ比率</p>
        <StagePieCharts
          data={eachStageLog.map((item) => ({name: item.stage, value: item.records.length}))}
          log={eachStageLog}
          toolTipFunc={(value) => `${value}Play`}
        />
        <p className='title-paragraph'>ステージ別総貢献度比率</p>
        <StagePieCharts
          data={eachStageLog.map((item) => ({name: item.stage, value: item.records.reduce((acc, item) => { return acc += item.diff }, 0)}))}
          log={eachStageLog}
          toolTipFunc={(value) => `${value.toFixed(2)}P`}
        />
        <p className='title-paragraph'>ステージ別貢献度平均</p>
        <StagePieCharts
          data={eachStageLog.map((item) => ({name: item.stage, value: item.records.reduce((acc, item) => { return acc += item.diff }, 0) / item.records.length }))}
          log={eachStageLog}
          toolTipFunc={(value) => `${value.toFixed(2)}P`}
        />
      </>
    )
  }

  const DetailEachHour = () => {
    const playHourLogs = playerDetail?.log?.map((item) => new Date(item.datetime.date).getHours())
    console.log(playHourLogs)
    const playCount = playHourLogs.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {});
    const result = [];
    for (let i = 0; i <= 23; i++) {
      result.push(playCount[i] || 0);
    }

    return(
      <>
        <p className='title-paragraph'>プレイ時間傾向</p>
        <div className='centerize'>
          <TimeframeChart data={result}/>
        </div>
      </>
    )
  }

  const CharaChart = () => {
    const charaChartMock = [
      { name: null, count: null },
      { name: '赤鬼カギコ', count: 0, color: 'deeppink' },
      { name: '悪亜チノン', count: 0, color: 'deepskyblue' },
      { name: '不死ミヨミ', count: 0, color: 'gold' },
      { name: 'パイン', count: 0, color: 'yellow' },
      { name: '首塚ツバキ', count: 0, color: 'gainsboro' },
      { name: '紅刃', count: 0, color: 'crimson' },
      { name: '首塚ボタン', count: 0, color: 'orchid' },
      { name: 'クルル', count: 0, color: 'green' },
      { name: null, count: null },
      { name: '最愛チアモ', count: 0, color: 'lightpink' },
      { name: 'マラリヤ', count: 0, color: 'purple' },
      { name: 'ツバキ【廻】', count: 0, color: 'indigo' },
    ]

    const maxChara = charaChartMock.length

    // 日付ごとにデータを集計するためのオブジェクトを作成
    const dateMap = playerDetail?.log?.reduce((acc, { datetime, chara }) => {
      const date = new Date(datetime.date)
      const shortDate = `${date.getMonth() + 1}/${date.getDate()}`
      const charaKey = charaChartMock[chara].name

      if (!acc[shortDate]) {
        acc[shortDate] = { date: shortDate }
        for (let i = 1; i < maxChara; i++) {
          acc[shortDate][charaChartMock[i].name] = 0
        }
      }

      acc[shortDate][charaKey] += 1; // キャラクターのカウントをインクリメント

      return acc;
    }, {});

    // 最終結果の配列を作成
    const result = Object.values(dateMap);
    const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

    const getPercent = (value, total) => {
      const ratio = total > 0 ? value / total : 0;

      return toPercent(ratio, 2);
    };

    console.log(result, dateMap);
    return(
      <>
        <p className='title-paragraph'>ランキング上のキャラクター変遷</p>
        <AreaChart
          width={Math.min(window.innerWidth - 20, 600)}
          height={160}
          data={result}
          stackOffset="expand"
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(decimal) => `${decimal * 100}%`} />
          {
            charaChartMock.map((chara, index) => {
              return(<Area type={"monotone"} dataKey={chara.name} stackId={1} stroke="#aaa" fill={chara.color} />)
            })
          }
          <Tooltip />
        </AreaChart>
      </>
    )
  }

  if (false) return( //playerDetail && !playerDetail.isPublicDetail) return(
    <>
      <div id="player-detail-wrapper">
        <div className="player-detail">
          <Achievement title={playerDetail?.achievement} />
          {playerDetail && <Player name={playerDetail.player_name} header={`${playerDetail.ranking}位 - ${playerDetail.point}P`} chara={playerDetail.chara} />}
          <p className='description'>このユーザの詳細データは非公開です</p>
        </div>
      </div>
    </>
  )

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
            <DetailEachStage />
            <DetailEachHour />
            <CharaChart />
          </div>
          <div id="table-wrapper">
            <div>
              <AverageGraph log={playerDetail?.log?.slice(0, 300) || []} average={playerDetail?.effective_average}/>
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

export default PlayerDetailPage
