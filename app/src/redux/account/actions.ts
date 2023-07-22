const actions = {
  MIAUTH: 'MIAUTH',
  TRY_LOGIN: 'TRY_LOGIN',
  DONE_LOGIN: 'DONE_LOGIN',
  TEST: 'TEST',

  miAuth: (origin: string, session: string) => ({
    type: actions.MIAUTH,
    payload: {
      origin,
      session
    }
  })
}

export default actions
