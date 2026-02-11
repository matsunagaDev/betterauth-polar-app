# betterauth-polar-app

BetterAuth、Polar、Turso を組み合わせた認証・サブスクリプション付き Next.js アプリ。

- **認証**: メール/パスワード、GitHub OAuth、匿名ログイン
- **決済**: Polar（sandbox 環境）
- **DB**: Turso（ローカルは libsql）、Drizzle ORM

## 前提条件

- Node.js
- pnpm（`npm install -g pnpm`）
- Turso CLI（macOS: `brew install tursodatabase/tap/turso`）

## クローン後に作成が必要なもの

リポジトリには含まれていないため、以下を**自前で作成**する。

| 種別         | パス                | 作成方法                  |
| ------------ | ------------------- | ------------------------- |
| ディレクトリ | `db/local/`         | `mkdir -p db/local`       |
| ファイル     | `db/local/local.db` | `touch db/local/local.db` |
| ファイル     | `.env`              | `touch .env`              |

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <リポジトリURL>
cd betterauth-polar-app
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. ローカル DB 用のディレクトリとファイルを作成

```bash
mkdir -p db/local && touch db/local/local.db
```

### 4. 環境変数を設定

プロジェクト直下に `.env` を作成し、次を設定する。

```env
TURSO_DATABASE_URL="http://127.0.0.1:8080"
TURSO_AUTH_TOKEN=local
BETTER_AUTH_SECRET="任意の文字列"
BETTER_AUTH_URL="http://localhost:3000"
POLAR_ACCESS_TOKEN="Polar ダッシュボード（sandbox）で取得"
POLAR_PRODUCT_ID="Polar の商品 ID"
POLAR_SUCCESS_URL="http://localhost:3000"
```

GitHub ログインを使う場合のみ追加:

```env
GITHUB_CLIENT_ID="GitHub OAuth App の Client ID"
GITHUB_CLIENT_SECRET="GitHub OAuth App の Client Secret"
```

### 5. Turso ローカルサーバーを起動

**別ターミナル**で次を実行し、**起動したまま**にする。

```bash
turso dev -f db/local/local.db
```

### 6. マイグレーションを実行

`turso dev` が起動している状態で実行する。  
（`migrations/` はリポジトリに含まれているため、`generate` は不要）

```bash
npx drizzle-kit migrate
```

### 7. 開発サーバーを起動

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

| コマンド                   | 用途                                                     |
| -------------------------- | -------------------------------------------------------- |
| `npx drizzle-kit migrate`  | 既存のマイグレーションを DB に適用                       |
| `npx drizzle-kit generate` | `db/schemas/*.ts` の変更から新しいマイグレーションを生成 |
| `npx drizzle-kit studio`   | DB の GUI を起動                                         |

スキーマ変更時は、`generate` → `migrate` の順で実行する。
