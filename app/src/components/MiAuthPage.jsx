import React, {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useLocation, useParams} from 'react-router-dom';
import actions from '../redux/account/actions.ts';
import {Player} from './Player';

export const MiAuth = () => {
  const search = useLocation().search
  const query = new URLSearchParams(search)
  const session = query.get('session')
  const origin = document.referrer ? new URL(document.referrer).hostname : null
  const dispatch = useDispatch()

  const { token, suggestPlayers, user } = useSelector(state => state.accountReducer)
  const authStatus = useMemo(() => token !== null, [token])

  useEffect(() => {
    if (query && session && origin) dispatch(actions.miAuth(origin, session))
  }, [])

  const clickHandler = (player_name) => {
    const yn = window.confirm(`${player_name}でお間違いないですか？`)
    if (yn === true) dispatch(actions.linkPlayer(player_name))
  }

  console.log(user)

  return(
    <>
      <div id="ranking-wrapper">
      <div className="ranking">
        {( user === null ) ? (
          <>
            <p>あなたのプレイヤーアカウントを選択してください</p>
            <p>この操作は一度しか行えません</p>
            {suggestPlayers?.map((player) => (
              <div onClick={()=>{clickHandler(player.player_name)}}>
                <Player chara={player.chara} name={player.player_name} isLink={false} />
              </div>
            ))}
          </>
        ) : (
          <>
            <p>ログインしました</p>
          </>
        )}
      </div>
      </div>
    </>
  )
}
