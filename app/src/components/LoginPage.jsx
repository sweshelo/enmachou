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
    setMisskeyServerDomaian(e.target.value)
  }

  return(
    <div id="login" style={pageStyle}>
      <h2>ログイン</h2>
      <p className='medium'>
        ログインすることで閻魔帳の設定を変更できるようになります
      </p>
      <p className='medium description' style={{textAlign: 'left'}}>
        ※ 新規登録(初めてログイン)する場合は<br />次の要件を満たす必要があります<br />
        ・<a href="https://misskey.sweshelo.jp/@enma" className="link">@enma@misskey.sweshelo.jp</a>をフォローしている<br />
        ・Misskeyのアカウント名がCCJのプレイヤー名の一部と一致している<br />
        ・Misskey上に10Note以上投稿している<br />
        ・<span style={{color: 'red'}}>(misskey.ioの場合)アカウントが2023年8月21日以前に作られている</span>
      </p>
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
        <Input type={'text'} placeholder={'サーバのドメインを入力 (例: misskey.cloud)'} style={{width: '90%', margin: '5px'}} onChange={handleChange}></Input>
        <Button style={{width: '90%'}} href={generateMiAuthURL(misskeyServerDomain)}>
          <img src='img/misskey.png' height={'22px'}/> その他のMisskeyサーバでログイン
        </Button>
      </div>
      <h2>Misskeyに登録</h2>
      <p className='medium'>
        Misskeyは分散型SNSのネットワーク『Fediverse』を構築するソフトウェアの1つで、日本においても100を超えるサーバが運用されています。<br /><br />
        Misskeyサーバを探す: <a style={{color: 'blue'}} className="link" href="https://join.misskey.page/ja-JP/instances">https://join.misskey.page/ja-JP/instances</a>
      </p>
    </div>
  )
}
