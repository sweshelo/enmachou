# 閻魔帳
閻魔帳はアーケードゲーム『チェイスチェイスジョーカーズ』の全国ランキングデータを自動収集し、各プレイの獲得貢献度を推定するアプリです。

# 開発環境のセットアップ
予め最新版のNode.jsが実行できる環境とDocker環境が必要です。

```bash
# 1. Nodeのモジュールをインストールする
cd app && yarn install
cd api && yarn install

# 2. 設定ファイルをコピーする
cp app/src/config.js.tmp app/src/config.js

# 3. docker imageをビルドする
docker compose build

# 4. 開始
docker compose up -d
```

APIは4400番ポートで、Reactのアプリケーションは5500番ポートでそれぞれホストされます。
