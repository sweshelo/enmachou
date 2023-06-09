interface OnlineRequestBody{
  threshold: undefined | number
}

interface CreateAccountBody{
  userId: string
  playerId: number
  password: string
}

interface Auth{
  userId: string
  token: string
}

export { OnlineRequestBody, CreateAccountBody, Auth }
