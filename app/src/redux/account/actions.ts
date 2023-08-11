import {Player, User} from "../type"

const actions = {
  MIAUTH: 'MIAUTH',
  TRY_LOGIN: 'TRY_LOGIN',
  DONE_LOGIN: 'DONE_LOGIN',
  TEST: 'TEST',
  SET_AUTHORIZE: 'SET_AUTHORIZE',
  LINK_PLAYER: 'LINK_PLAYER',

  miAuth: (origin: string, session: string) => ({
    type: actions.MIAUTH,
    payload: {
      origin,
      session
    }
  }),

  setAuthorize: (payload: {token: string, suggestPlayers: Player[], user: User}) => ({
    type: actions.SET_AUTHORIZE,
    payload: {
      token: payload.token,
      suggestPlayers: payload.suggestPlayers,
      user: payload.user,
    }
  }),

  linkPlayer: (playerName: string) => ({
    type: actions.LINK_PLAYER,
    payload: {
      playerName
    }
  })
}

export default actions
