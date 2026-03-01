FROM node:22-alpine

WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@10.16.0 --activate

# 依存関係ファイルだけ先にコピー（キャッシュ効率のため）
COPY package.json pnpm-lock.yaml ./

# 依存関係インストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
