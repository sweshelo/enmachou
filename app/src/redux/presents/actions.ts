const actions = {
  GET_PRESENTS: 'GET_PRESENTS',
  SET_PRESENTS: 'SET_PRESENTS',

  getPresents: () => ({
    type: actions.GET_PRESENTS
  }),
  setPresents: (payload) => ({
    type: actions.SET_PRESENTS,
    payload
  })
}

export default actions
