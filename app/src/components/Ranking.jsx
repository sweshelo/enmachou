import React, { useState, useEffect } from "react"
import {useDispatch, useSelector} from "react-redux";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import actions from "../redux/records/actions.ts";
import {Player} from "./Player";
import PresentModule from "./PresentModule.tsx";
import './Ranking.css';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 11;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#333">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={25} textAnchor="middle" fontSize={12} fill="#333">
        {payload.count}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 2}
        outerRadius={outerRadius + 6}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}`} stroke={fill} fill="none" />
      <circle cx={mx} cy={my} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} textAnchor={textAnchor} fontSize={10} fill="#333">{`${payload.count}人`}</text>
    </g>
  );
};

const CharaChart = ({data, clickHandler = ()=>{}}) => {
  const [ hoverIndex, setHoverIndex ] = useState(0)
  return(
    <PieChart width={350} height={210} id="chara-chart">
      <Pie
        data={data}
        cx={175}
        cy={100}
        innerRadius={50}
        outerRadius={75}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="count"
        activeIndex={hoverIndex}
        activeShape={renderActiveShape}
        onMouseEnter={(_, index) => setHoverIndex(index)}
        onClick={(_, index) => clickHandler(index)}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

const Ranking = () => {
  const [ charaChartData, setCharaChartData ] = useState([])
  const [ isFiltered, setFilter ] = useState(false)
  const [ filterChara, setFilterChara ] = useState('0')
  const dispatch = useDispatch()
  const ranking = useSelector(state => state.recordsReducer)

  useEffect(() => {
    dispatch(actions.getRankingPlayerList())
  }, [])

  useEffect(() => {
    const charaChartMock = {
      '1': { name: '赤鬼カギコ', count: 0, color: 'deeppink' },
      '2': { name: '悪亜チノン', count: 0, color: 'deepskyblue' },
      '3': { name: '不死ミヨミ', count: 0, color: 'gold' },
      '4': { name: 'パイン', count: 0, color: 'yellow' },
      '5': { name: '首塚ツバキ', count: 0, color: 'gainsboro' },
      '6': { name: '紅刃', count: 0, color: 'crimson' },
      '7': { name: '首塚ボタン', count: 0, color: 'orchid' },
      '8': { name: 'クルル', count: 0, color: 'green' },
      '9': { name: 'ミロク', count: 0, color: 'chartreuse' },
      '10':{ name: '最愛チアモ', count: 0, color: 'lightpink' },
      '11':{ name: 'マラリヤ', count: 0, color: 'purple' },
      '12':{ name: 'ツバキ【廻】', count: 0, color: 'indigo' },
      '13':{ name: 'ジョウカ', count: 0, color: 'skyblue' },
      '14':{ name: 'ジャスイ', count: 0, color: 'wheat' },
      '101':{ name: 'カギコ[サカサマ]', count: 0, color: 'deeppink' },
    }
    ranking?.standardRanking?.forEach((r) => charaChartMock[parseInt(r.chara || '0')].count++)
    setCharaChartData(Object.fromEntries(
      Object.entries(charaChartMock).filter(([_, value]) => value.count > 0)
    ))
  }, [ranking])

  const charaFilterClickHandler = (index) => {
    if (Object.keys(charaChartData)[index] === filterChara) {
      setFilter(!isFiltered)
    }else{
      setFilter(true)
    }
    setFilterChara(Object.keys(charaChartData)[index])
  }

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        {/*
        <h2 className="page-title rainbow-grad-back">夏のプレゼントキャンペーン</h2>
        <p className="description">7/28（金）10:00 ～ 8/31（木）09:59</p>
        <p className="title-paragraph">グッズの残り先着枠</p>
        <PresentModule />
        */}
        <h2 className="page-title rainbow-grad-back">月間ランキング</h2>
        <p className="title-paragraph">現在のキャラクター構成比率</p>
        <div className="centerize">
          <CharaChart data={Object.values(charaChartData).filter((c) => c.count && c.count > 0)} clickHandler={charaFilterClickHandler} />
        </div>
        {ranking?.standardRanking?.filter(r => (isFiltered ? r.chara === filterChara : true)).map((r, index) => <Player key={index} name={r.player_name} chara={r.chara} header={`${r.ranking}位 - ${r.point}P`} isLink={true}/>)}
      </div>
    </div>
  )
}

export default Ranking;
