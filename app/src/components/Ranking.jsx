import React, { useState, useEffect } from "react"
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { config } from "../config"
import './Ranking.css';

const User = ({props}) => {
  return(
    <div>
      <a href={props.player_name !== 'プレーヤー' ? `/player/${props.player_name}` : null} className="player">
        <img className="character" src={`https://p.eagate.573.jp/game/chase2jokers/ccj/images/ranking/icon/ranking_icon_${props.chara}.png`} />
        <div className="userinfo-wrapper">
          <p>{props.ranking}位 - {props.point}P</p>
          <h2 className="username">{props.player_name}</h2>
        </div>
      </a>
    </div>
  )
}

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
  const [ rankingData, setRankingData ] = useState([])
  const [ charaChartData, setCharaChartData ] = useState([])
  const [ isFiltered, setFilter ] = useState(false)
  const [ filterChara, setFilterChara ] = useState('0')

  useEffect(() => {
    const fetchRankingData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/ranking`, {credentials:'include'})
      const rankingArray = await response.json()
      setRankingData(rankingArray)
    }
    fetchRankingData()
  }, [])

  useEffect(() => {
    const charaChartMock = [
      { name: null, count: null },
      { name: '赤鬼カギコ', count: 0, color: 'deeppink' },
      { name: '悪亜チノン', count: 0, color: 'deepskyblue' },
      { name: '不死ミヨミ', count: 0, color: 'gold' },
      { name: 'パイン', count: 0, color: 'yellow' },
      { name: '首塚ツバキ', count: 0, color: 'gainsboro' },
      { name: '紅刃', count: 0, color: 'crimson' },
      { name: '首塚ボタン', count: 0, color: 'orchid' },
      { name: null, count: null },
      { name: null, count: null },
      { name: '最愛チアモ', count: 0, color: 'lightpink' },
      { name: 'マラリヤ', count: 0, color: 'purple' },
      { name: 'ツバキ【廻】', count: 0, color: 'indigo' },
    ]
    rankingData.forEach((r) => charaChartMock[parseInt(r.chara || '0')].count++)
    setCharaChartData(charaChartMock)
  }, [rankingData])

  const charaIndexTable = [ '1', '2', '3', '4', '5', '6', '7', '10', '12' ]
  const charaFilterClickHandler = (index) => {
    if (charaIndexTable[index] === filterChara) {
      setFilter(!isFiltered)
    }else{
      setFilter(true)
    }
    setFilterChara( charaIndexTable[index] )
  }

  return (
    <div id="ranking-wrapper">
      <div className="ranking">
        <h2 className="page-title rainbow-grad-back">月間ランキング</h2>
        <p className="title-paragraph">現在のキャラクター構成比率</p>
        <CharaChart data={charaChartData.filter((c) => c.count && c.count > 0)} clickHandler={charaFilterClickHandler} />
        {rankingData.filter(r => (isFiltered ? r.chara === filterChara : true)).map((r, index) => <User key={index} props={r} />)}
      </div>
    </div>
  )
}

export default Ranking;
