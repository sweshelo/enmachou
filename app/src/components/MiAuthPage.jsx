import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useLocation, useParams} from 'react-router-dom';
import actions from '../redux/account/actions.ts';

export const MiAuth = () => {
  const search = useLocation().search
  const query = new URLSearchParams(search)
  const session = query.get('session')
  const origin = document.referrer
  const authStatus = '認証中'
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(actions.miAuth(origin, session))
  }, [])
  console.log(origin, session)

  return(
    <>
      { authStatus }
    </>
  )
}
