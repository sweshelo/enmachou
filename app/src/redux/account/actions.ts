const actions = {
  MIAUTH: 'MIAUTH',
  TRY_LOGIN: 'TRY_LOGIN',
  DONE_LOGIN: 'DONE_LOGIN',
  TEST: 'TEST',
  SET_TOKEN: 'SET_TOKEN',

  miAuth: (origin: string, session: string) => ({
    type: actions.MIAUTH,
    payload: {
      origin,
      session
    }
  }),

  setToken: (token: string) => ({
    type: actions.SET_TOKEN,
    payload: {
      token
    }
  }),
}

export default actions
