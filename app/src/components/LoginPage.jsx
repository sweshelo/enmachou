import { Form, Input, Button } from 'antd';

export const Login = () => {
  const onFinish = () => {

  }

  const pageStyle = {
    padding: '10px 5px',
  }

  const wrapperStyle = {
    margin: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  return(
    <div id="login" style={pageStyle}>
      <h2>ログイン</h2>
      <p className='medium'>ログインすることで閻魔帳の設定を変更したり自分の記録を削除したりできるようになります</p>
      <div id="form-wrapper" style={wrapperStyle}>
        <Form name="login-form" onFinish={onFinish}>
          <Form.Item
            label="ユーザー名"
            name="username"
            rules={[
              { required: true, message: 'ユーザー名を入力してください' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="パスワード"
            name="password"
            rules={[
              { required: true, message: 'パスワードを入力してください' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              ログイン
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
