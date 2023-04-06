FROM node:latest

# アプリケーションを配置するディレクトリを作成
WORKDIR /app

# ポートのエクスポート
EXPOSE 5500

ENV TZ=Asia/Tokyo

# 起動コマンド
CMD bash -c "yarn start" #"npm install && npm run build && npm start"
