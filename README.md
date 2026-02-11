# betterauth-polar-app

BetterAuth、Polar、Turso を組み合わせた認証・サブスクリプション付き Next.js アプリ。

- **認証**: メール/パスワード、GitHub OAuth、匿名ログイン
- **決済**: Polar（sandbox 環境）
- **DB**: Turso（ローカルは libsql）、Drizzle ORM

## 前提条件

- Node.js
- pnpm（`npm install -g pnpm`）
- Turso CLI（macOS: `brew install tursodatabase/tap/turso`）

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. ローカル DB の準備

```bash
mkdir -p db/local
touch db/local/local.db
```

### 3. 環境変数の設定

プロジェクト直下に `.env` を作成し、以下を設定する。

```env
TURSO_DATABASE_URL="http://127.0.0.1:8080"
TURSO_AUTH_TOKEN=local
BETTER_AUTH_SECRET="任意の文字列"
BETTER_AUTH_URL="http://localhost:3000"
POLAR_ACCESS_TOKEN="Polar ダッシュボード（sandbox）で取得"
POLAR_PRODUCT_ID="Polar の商品 ID"
POLAR_SUCCESS_URL="http://localhost:3000"
```

GitHub ログインを使う場合:

```env
GITHUB_CLIENT_ID="GitHub OAuth App の Client ID"
GITHUB_CLIENT_SECRET="GitHub OAuth App の Client Secret"
```

### 4. Turso ローカルサーバーの起動

**別ターミナルで** 以下を実行し、起動したままにする。

```bash
turso dev -f db/local/local.db
```

### 5. マイグレーションの実行（初回のみ）

```bash
npx drizzle-kit migrate
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 にアクセスする。

## 動作確認

- **匿名ログイン**: `/sign-in` でメール不要でログイン
- **メール/パスワード**: `/sign-up` でサインアップ後、`/sign-in` でログイン
- **サブスクリプション**: ログイン後、ホーム画面のボタンから Polar チェックアウト・ポータルを利用
- **DB 確認**: `npx drizzle-kit studio` で DB の内容を参照・編集可能

## DB 関連コマンド

| コマンド | 用途 |
|----------|------|
| `npx drizzle-kit migrate` | DB にスキーマを反映 |
| `npx drizzle-kit generate` | スキーマ変更からマイグレーションを生成 |
| `npx drizzle-kit studio` | DB の GUI を起動 |
