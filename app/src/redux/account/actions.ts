import {Player, User} from "../type"

const actions = {
  MIAUTH: 'MIAUTH',
  TRY_LOGIN: 'TRY_LOGIN',
  DONE_LOGIN: 'DONE_LOGIN',
  SET_AUTHORIZE: 'SET_AUTHORIZE',
  LINK_PLAYER: 'LINK_PLAYER',
  SET_SETTINGS: 'SET_SETTINGS',
  CHANGE_SETTINGS: 'CHANGE_SETTINGS',
  LOGOUT: 'LOGOUT',

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
  }),

  changeSettings: (payload: {isHiddenDate: boolean, isHiddenTime: boolean}) => ({
    type: actions.CHANGE_SETTINGS,
    payload: {
      isHiddenDate: payload.isHiddenDate,
      isHiddenTime: payload.isHiddenTime,
    }
  }),

  setSettings: (payload: {isHiddenDate: boolean, isHiddenTime: boolean}) => ({
    type: actions.SET_SETTINGS,
    payload: {
      isHiddenDate: payload.isHiddenDate,
      isHiddenTime: payload.isHiddenTime,
    }
  }),


  logout: () => ({
    type: actions.LOGOUT
  })
}

export default actions
