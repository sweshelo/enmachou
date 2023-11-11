import React, { useState, useEffect, useMemo } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import { Link, useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Bar, ZAxis, RectangleProps, Scatter, BarChart } from 'recharts';
import actions from '../redux/records/actions.ts';
import Map from './Map';
import './PlayerPage.css';
import {Player} from './Player';
import { Spin } from 'antd';
import {TimeframeChart} from './Statistics';
import {Achievement, AverageGraph, DetailBoard, OnlineIndicator, PlayLog} from './PlayerPage';

const COLORS = ['#0088FE', '#55AAFF', '#00C49F', '#FFBB28', '#FF8042', '#F05040',];
const StagePieCharts = ({data, log, toolTipFunc}) => {
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

const StageBarCharts = ({data, log, toolTipFunc}) => {
  return(
    <BarChart
      data={data}
      width={Math.min(window.innerWidth - 20, 600)} height={160}
      margin={{
        top: 15,
        right: 20,
        left: 20,
        bottom: 5,
      }}
    >
      <XAxis dataKey="name" fontSize={'12px'} />
      <YAxis width={15}  fontSize={'12px'}/>
      <Bar dataKey={"value"}>
        {log.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % 20]} />
        ))}
      </Bar>
      <Tooltip formatter={toolTipFunc} />
    </BarChart>
  )
}

const PlayerDetailPage = () => {
  const { playerDetails } = useSelector((state) => state.recordsReducer)
  const { playername } = useParams()
  const playerDetail = playerDetails[playername]
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(actions.getPlayerDetail(playername, 10000))
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
    console.log(eachStageLog)
    return(
      <>
        <p className='description medium'>
          ステージ別の詳細データは公式ランキング上の<br />
          『最終更新』を全面的に信頼して算出されます。<br />
          従ってステージ選出バグや時間差によって<br />
          別のステージが選出されている場合も<br />
          スケジュール上のステージが採用されます。
        </p>
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
          toolTipFunc={(value) => `${value}P`}
        />
        <p className='title-paragraph'>ステージ別貢献度平均</p>
        <StagePieCharts
          data={eachStageLog.map((item) => ({name: item.stage, value: item.records.reduce((acc, item) => { return acc += item.diff }, 0) / item.records.length }))}
          log={eachStageLog}
          toolTipFunc={(value) => `${value.toFixed(2)}P`}
        />
        <p className='title-paragraph'>ステージ別貢献度平均差分</p>
        <p className='description medium'>
          このグラフはステージ毎の平均貢献度と有効平均貢献ポイントとの差を表示しています
        </p>
        <StageBarCharts
          data={eachStageLog.map((item) => ({name: item.stage, value: item.records.reduce((acc, item) => { return acc += (item.diff) }, 0) / item.records.length - playerDetail?.effective_average }))}
          log={eachStageLog}
          toolTipFunc={(value) => `${value.toFixed(2)}P`}
        />
      </>
    )
  }

  const DetailEachHour = () => {
    const playHourLogs = playerDetail?.log?.map((item) => new Date(item.datetime.date).getHours())
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
      { name: 'ミロク', count: 0, color: 'chartreuse' },
      { name: '最愛チアモ', count: 0, color: 'lightpink' },
      { name: 'マラリヤ', count: 0, color: 'purple' },
      { name: 'ツバキ【廻】', count: 0, color: 'indigo' },
      { name: 'ジョウカ', count: 0, color: 'skyblue' },
    ]
    const listedChara = []

    // 日付ごとにデータを集計するためのオブジェクトを作成
    const dateMap = playerDetail?.log?.reduce((acc, { datetime, chara }) => {
      const date = new Date(datetime.date)
      const shortDate = `${date.getMonth() + 1}/${date.getDate()}`
      const charaKey = charaChartMock[chara].name

      if (!acc[shortDate]) {
        acc[shortDate] = { date: shortDate }
      }

      if (!acc[shortDate][charaKey]) acc[shortDate][charaKey] = 0
      acc[shortDate][charaKey] += 1; // キャラクターのカウントをインクリメント
      if (!listedChara.includes(charaKey)) listedChara.push(charaKey)

      return acc;
    }, {});

    // 最終結果の配列を作成
    const result = Object.values(dateMap);

    return(
      <>
        <p className='title-paragraph'>ランキング上のキャラクター変遷</p>
        <AreaChart
          width={Math.min(window.innerWidth - 20, 600)}
          height={160}
          data={result}
          stackOffset="expand"
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={10}/>
          <YAxis tickFormatter={(decimal) => `${decimal * 100}%`} fontSize={10} width={20}/>
          {
            charaChartMock.map((chara, index) => {
              return listedChara.includes(chara.name) ? (<Area type={"monotone"} dataKey={chara.name} stackId={1} stroke={chara.color} fill={chara.color} />) : null
            })
          }
          <Tooltip />
          <Legend fontSize={10}/>
        </AreaChart>
      </>
    )
  }

  const RankingChart = () => {
    return(
      <>
        <p className='title-paragraph'>ランキング順位変遷</p>
        <LineChart
          width={Math.min(window.innerWidth - 20, 600)}
          height={160}
          data={playerDetail?.log}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="datetime.date" fontSize={10} reversed={true} tickFormatter={(r) => {
            const date = new Date(r);
            return `${date.getMonth() + 1}/${date.getDate()}`;
            }}/>
          <YAxis dataKey="ranking" fontSize={10} width={15} reversed={true} domain={[1, 100]}/>
          <Tooltip />
          <Legend fontSize={10}/>
          <Line type="monotone" dataKey="ranking" stroke="#82ca9d" dot={false}/>
        </LineChart>
      </>
    )
  }

  const AchievementsTable = () => {
    const achievements = Array.from(new Set(playerDetail?.log.map(l => l.achievement)))
    const dateFormatter = (dateString) => {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    return(
      <>
        <p className='title-paragraph'>称号変遷</p>
        <p className='description medium'>
          各称号が初めてランキング上に掲載された日時が表示されます
        </p>
        <table>
          <thead>
            <tr>
              <td>日時</td><td>称号名</td>
            </tr>
          </thead>
          <tbody>
            {achievements.map(achievement => <tr><td>{dateFormatter(playerDetail?.log.find(log => log.achievement === achievement).datetime.date)}</td><td>{achievement}</td></tr>)}
          </tbody>
        </table>
      </>
    )
  }

  {/*
  const RecordsChartGraph = () => {
    const calc = {}
    playerDetail?.log?.slice(-300).forEach((r) => {
      if(r.elapsed > 600) return
      const date = new Date(r.datetime.date)
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`
      if(!calc[dateKey]){
        calc[dateKey] = {
          date: dateKey,
          records: [r]
        }
      }else{
        calc[dateKey].records.push(r)
      }
    })

    const data = Object.values(calc).slice(-30).map((item) => {
      console.log(item)
      const records = item.records;
      records.sort((a, b) => a.diff - b.diff);
      const min = records[0].diff;
      const max = records[records.length - 1].diff;
      const median = records[Math.floor(records.length / 2)].diff;
      const firstQuartile = records[Math.floor(records.length / 4)].diff;
      const thirdQuartile = records[Math.floor((3 * records.length) / 4)].diff;
      console.log(max)

      return {
        name: item.date,
        min,
        max,
        median,
        lowerQuartile: firstQuartile,
        upperQuartile: thirdQuartile,
        average: records.reduce((acc, item) => acc += item.diff, 0) / records.length
      };
    });
    console.log(`data: ${data}`)
    console.log(data, calc)

    const useBoxPlot = (boxPlots) => {
      const data = useMemo(
        () =>
        boxPlots.map(v => {
          return {
            name: v.name,
            min: v.min,
            max: v.max,
            bottomWhisker: v.lowerQuartile - v.min,
            bottomBox: v.median - v.lowerQuartile,
            topBox: v.upperQuartile - v.median,
            topWhisker: v.max - v.upperQuartile,
            average: v.average,
            size: 500
          };
        }),
        [boxPlots]
      );

      return data;
    };

    const DotBar = (props) => {
      const { x, y, width, height } = props;
      if (x == null || y == null || width == null || height == null) {
        return null;
      }
      console.log(props)
      return (
        <line
          x1={x + width / 2}
          y1={y + height}
          x2={x + width / 2}
          y2={y}
          stroke={'#000'}
          strokeWidth={5}
          stroke-dasharray={'5'}
        />
      );
    };

    const HorizonBar = (props) => {
      const { x, y, width, height } = props;
      if (x == null || y == null || width == null || height == null) {
        return null;
      }
      return <line x1={x} y1={y} x2={x + width} y2={y} stroke={'#000'} strokeWidth={3} />;
    };

    return(
      <ComposedChart width={600} height={400} data={useBoxPlot(data)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ZAxis type='number' dataKey='size' range={[0, 250]} />
        <Tooltip />
        <CartesianGrid strokeDasharray='3 3' />
        <Bar stackId={'a'} dataKey={'min'} fill={'none'} />
        <Bar stackId={'a'} dataKey={'max'} fill={'none'} />
        <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} />
        <Bar stackId={'a'} dataKey={'bottomWhisker'} shape={<DotBar />} />
        <Bar stackId={'a'} dataKey={'bottomBox'} fill={'#8884d8'} />
        <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} />
        <Bar stackId={'a'} dataKey={'topBox'} fill={'#8884d8'} />
        <Bar stackId={'a'} dataKey={'topWhisker'} shape={<DotBar />} />
        <Bar stackId={'a'} dataKey={'bar'} shape={<HorizonBar />} />
        <Line type="monotone" dataKey="average" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="max" stroke="#82ca9d" />
      </ComposedChart>
    )
  }
  */}

  return (playerDetail && !playerDetail.isPublicDetail)
    ? (
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
    : (
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
              <RankingChart />
              <AchievementsTable />
            </div>
            <div id="table-wrapper">
              <div>
                <AverageGraph log={playerDetail?.log?.slice(-1000) || []} average={playerDetail?.effective_average}/>
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
