import { Form, Input, Button } from 'antd';
import {useState} from 'react';
import {config} from '../config';
import './LoginPage.css';

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

  console.log(crypto.randomUUID())

  const generateMiAuthURL = (domain) => `https://${domain}/miauth/${crypto.randomUUID()}?name=閻魔帳&callback=${config.enmaAppOrigin}/miauth&permission=read:account,read:following`

  const [ misskeyServerDomain, setMisskeyServerDomaian ] = useState('')
  const handleChange = (e) => {
    console.log(e.target.value)
    setMisskeyServerDomaian(e.target.value)
  }

  return(
    <div id="login" style={pageStyle}>
      <h2>ログイン</h2>
      <p className='medium'>ログインすることで閻魔帳の設定を変更したり自分の記録を削除したりできるようになります</p>
      <div className='misskey-server-button'>
        <Button style={{width: '90%'}} href={generateMiAuthURL('misskey.io')}>
          <img src='img/misskey-io.jpg' height={'22px'}/> misskey.ioでログイン
        </Button>
      </div>
      <div className='misskey-server-button'>
        <Button style={{width: '90%'}} href={generateMiAuthURL('misskey.sweshelo.jp')}>
          <img src='img/misskey.png' height={'22px'}/> 閻魔帳 Misskey支部でログイン
        </Button>
      </div>
      <div className='misskey-server-button-ex'>
        <Input type={'text'} placeholder={'rhythmisskey.games'} style={{width: '90%', margin: '5px'}} onChange={handleChange}></Input>
        <Button style={{width: '90%'}} href={generateMiAuthURL(misskeyServerDomain)}>
          <img src='img/misskey.png' height={'22px'}/> その他のMisskeyサーバでログイン
        </Button>
      </div>
    </div>
  )
}
