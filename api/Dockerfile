FROM node:latest

# パッケージのインストール
RUN apt-get update && \
    apt-get install -y mariadb-client && \
    rm -rf /var/lib/apt/lists/*

# アプリケーションを配置するディレクトリを作成
WORKDIR /app

# ローカルのpackage.jsonをコンテナにコピーし、依存パッケージをインストール
COPY package*.json ./
RUN npm install

# ソースコードをコンテナにコピー
COPY . .

# ポートのエクスポート
EXPOSE 4400

# 起動コマンド
CMD ["npm", "run", "start"]
