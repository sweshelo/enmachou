import {Progress} from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/presents/actions.ts";
import {PresentsItem, PresentsItemHistory} from "../redux/type";

const PresentModule = () => {
  const dispatch = useDispatch()
  const {items} = useSelector((state): any => state.presentsReducer)
  useEffect(() => {
    dispatch(actions.getPresents())
  }, [])

  const divStyle = {
    backgroundColor: 'white',
    margin: '8px 5px',
    padding: '10px',
    borderRadius: '8px',
  }

  interface ItemProgressProps {
    percent: number
    product: string
  }

  const RemainAlart: React.FC<{remain: number}> = ({remain}) => {
    const style = {
      backgroundColor: 'lightpink',
      borderRadius: '5px',
      fontSize: '10px',
      padding: '2px',
      margin: '5px 0px'
    }
    return(
      <div style={style}>
        残り {remain} 個
      </div>
    )
  }

  const ItemProgress: React.FC<ItemProgressProps> = ({percent, product}) => {
    const style = {
      margin: '5px 0',
      padding: '3px 10px'
    }
    return(
      <div style={style}>
        <p>{product.original_name}</p>
        { product.history[ product.history.length - 1 ].remain < 30 && <RemainAlart remain={product.history[ product.history.length - 1 ].remain} /> }
        <Progress percent={Math.round(percent)} size="small" status={percent == 0 ? "exception" : "normal"}/>
      </div>
    )
  }

  return(
    <div className="summer2023-present" style={divStyle}>
      {items?.map((item: PresentsItem) => {
        item.history.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        const latestHistory = item.history[ item.history.length - 1 ]
        return latestHistory.remain === 0 ? null : (<ItemProgress percent={latestHistory.remain / latestHistory.count * 100} product={item} />)
      })}
    </div>
  )
}

export default PresentModule
