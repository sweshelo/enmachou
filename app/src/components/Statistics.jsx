import React, { useState, useEffect } from "react"
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { config } from "../config"
import './Statistics.css'

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
        {`${(percent * 100).toFixed(2)}%`}
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} textAnchor={textAnchor} fontSize={10} fill="#333">{`${payload.count}件`}</text>
    </g>
  );
};

const CharaChart = ({data}) => {
  const [ hoverIndex, setHoverIndex ] = useState(0)
  return(
    <PieChart width={350} height={210} id="chara-chart">
      <Pie
        data={Object.values(data)}
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
      >
        {Object.values(data).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  )
}

const Statistics = () => {
  const [ charaChartData, setCharaChartData ] = useState(null)
  const [ focusDateIndex, setFocusDateIndex ] = useState(0)

  useEffect(() => {
    const fetchCharaChartData = async() => {
      const response = await fetch(`${config.baseEndpoint}/api/stats/chara`)
      const chartArray = await response.json()
      setCharaChartData(chartArray)
    }
    fetchCharaChartData()
  }, [])

  const handleDateChange = ((direction) => {
    setFocusDateIndex(focusDateIndex + direction)
  })

  return (
    <div id="user-detail-wrapper">
      <div>
        <div className="ranking">
          <h2 className="page-title rainbow-grad-back">統計</h2>
          <p className="title-paragraph">プレイ上のキャラクター構成比率</p>
          <p className="description medium">プレイヤーのプレイを検知した際にそのプレイヤーのランキング上に表示されていたキャラクターの構成比率です<br />※実際にプレイヤーがこのキャラクターを使用していたとは限りません</p>
          <div className="date-picker">
            <button onClick={()=>{handleDateChange(-1)}} disabled={focusDateIndex <= 0}>{'<'}</button>
            <span>{charaChartData?.dateKeys[focusDateIndex] || null}</span>
            <button onClick={()=>{handleDateChange(+1)}} disabled={focusDateIndex + 1 >= charaChartData?.dateKeys?.length}>{'>'}</button>
          </div>
          <div className="chart-wrapper">
            { charaChartData && <CharaChart data={charaChartData.data[charaChartData.dateKeys[focusDateIndex]].play} />}
          </div>
        </div>
        <div className="ranking">
          <p className="title-paragraph">ランキング上のキャラクター構成比率</p>
          <p className="description medium">指定日における最終ランキング取得時のキャラクター構成比率です</p>
          <div className="date-picker">
            <button onClick={()=>{handleDateChange(-1)}} disabled={focusDateIndex <= 0}>{'<'}</button>
            <span>{charaChartData?.dateKeys[focusDateIndex] || null}</span>
            <button onClick={()=>{handleDateChange(+1)}} disabled={focusDateIndex + 1 >= charaChartData?.dateKeys?.length}>{'>'}</button>
          </div>
          <div className="chart-wrapper">
            { charaChartData && <CharaChart data={charaChartData.data[charaChartData.dateKeys[focusDateIndex]].ranking} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
