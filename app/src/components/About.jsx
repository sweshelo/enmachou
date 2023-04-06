import "./About.css"

export const About = () => {
  return(
    <div id="about">
      <div id="about-header">
        <h2>閻魔帳</h2>
        <p><a href="https://twitter.com/sweshelo">@sweshelo</a></p>
      </div>
      <p className="about-description">閻魔帳は、アーケードゲーム『チェイスチェイスジョーカーズ』のランキングを自動で収集することで、ランキング上位のプレイヤーのプレイ履歴を可視化するツールです。</p>
      <p className="about-description">公式のランキングを参照している関係上、ランキング圏外の方は記録の参照が出来ません。また、ランキングで名前を非表示にされている方も記録の参照が出来ませんので予めご了承下さい。</p>
      <p className="about-description">ランキングの収集は5分おきに行っております。その為、更新間隔の間に2回以上プレイされると異常な値が記録されます。</p>
      <p className="about-description">バグ報告や修正、機能の追加などをGitHub上でいつでも受け付けています。</p>
      <a href="https://github.com/sweshelo/enmachou">https://github.com/sweshelo/enmachou</a>
    </div>
  )
}
