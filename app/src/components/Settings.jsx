import {Button, Switch} from 'antd';
import React, { useState, useMemo } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import actions from '../redux/account/actions.ts';
import './Settings.css'
import { Player } from './Player';

export const Settings = () => {
  const dispatch = useDispatch()

  const { token, suggestPlayers, user } = useSelector(state => state.accountReducer)
  const authStatus = useMemo(() => token !== null, [token])
  const logout = () => {
    dispatch(actions.logout())
  }

  const [ hiddenTime, setHiddenTime ] = useState(false)
  const [ hiddenDate, setHiddenDate ] = useState(false)

  useState(() => {
    setHiddenDate(user?.isHiddenDate === -1)
    setHiddenTime(user?.isHiddenTime === -1)
  }, [user])

  return(
    <>
      <div className=''>
        <h2>設定</h2>
        <div className='settings'>
          {//<Player chara={user?.chara}/>
          }
          <div className='switch'>
            <Switch checked={hiddenTime} onChange={() => setHiddenTime(!hiddenTime)}/> プレイ時間を隠す
          </div>
          <div className='switch'>
            <Switch checked={hiddenDate} onChange={() => setHiddenDate(!hiddenDate)}/> プレイ日付を隠す
          </div>
          <div className='switch'>
            <Switch disabled/> 制県度を隠す
          </div>
          <Button type={'primary'}
            onClick={() => {
              console.log('hi')
              dispatch(actions.changeSettings({isHiddenDate: hiddenDate ? -1 : 0, isHiddenTime: hiddenTime ? -1 : 0}))
            }}
          >
            保存する
          </Button>
        </div>
        <div className='logout'>
          <Button onClick={logout} danger>
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
