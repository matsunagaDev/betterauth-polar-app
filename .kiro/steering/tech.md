# 技術スタック

## アーキテクチャ

Next.js App Router によるフルスタック構成。サーバーコンポーネントで認証チェック → tRPC で型安全な API → Drizzle ORM で DB アクセスという3層構造。決済は Polar SDK + Better Auth プラグインで一体化。

## コア技術

- **言語**: TypeScript（strict mode）
- **フレームワーク**: Next.js 16.1.1（App Router）
- **ランタイム**: Node.js 20+
- **UI**: React 19.2.3

## 主要ライブラリ

| カテゴリ | ライブラリ | 役割 |
|---------|-----------|------|
| 認証 | better-auth 1.3.26 | セッション管理、OAuth、匿名ログイン |
| 決済 | @polar-sh/sdk 0.35.4 + @polar-sh/better-auth 1.1.9 | サブスクリプション決済・ポータル |
| API | @trpc/server 11.9.0 + @trpc/client 11.9.0 | 型安全な RPC |
| ORM | drizzle-orm 0.45.1 | SQLite/Turso スキーマ定義・クエリ |
| DB | @libsql/client 0.15.15 | Turso（libSQL）接続 |
| UI | shadcn/ui + Radix UI | コンポーネントライブラリ |
| バリデーション | zod 4.3.6 | スキーマバリデーション |
| フォーム | react-hook-form 7.70.0 | フォーム状態管理 |
| シリアライズ | superjson 2.2.6 | tRPC データ変換 |

## 開発基準

### 型安全

- TypeScript strict mode 必須
- tRPC で API の入出力を型定義
- Drizzle スキーマから DB 型を自動推論

### コード品質

- ESLint（eslint-config-next）
- Tailwind v4 + CSS Variables

### テスト

- 未導入（Phase 5 以降で検討）

## 開発環境

### 必要ツール

- Node.js 20+ / pnpm
- Turso CLI（`turso dev` でローカル DB 起動）
- Drizzle Kit（マイグレーション管理）
- Docker（コンテナ開発環境）

### 主要コマンド

```bash
# 開発サーバー起動
pnpm dev

# ローカル DB 起動
turso dev --db-file db/local/local.db

# マイグレーション生成
pnpm drizzle-kit generate

# マイグレーション適用
pnpm drizzle-kit migrate

# DB GUI
pnpm drizzle-kit studio

# Docker 開発環境
docker compose up

# Docker 本番ビルド
docker compose -f docker-compose.prod.yml up
```

## Docker 構成

- **開発用**: `Dockerfile` + `docker-compose.yml` -- ホットリロード対応（ボリュームマウント）
- **本番用**: `Dockerfile.prod` + `docker-compose.prod.yml` -- `pnpm build` + `pnpm start`
- ベースイメージ: `node:20-alpine`
- pnpm は corepack 経由で有効化

## 主要技術決定

| 決定 | 根拠 |
|------|------|
| Polar（非 Stripe） | Better Auth 公式プラグインで Webhook 不要、最小コード |
| Turso（非 PostgreSQL） | SQLite 互換でローカル開発が容易、Edge 対応 |
| tRPC（非 REST） | 型安全 + プロシージャ階層（base/protected/subscribe） |
| shadcn/ui（非 MUI 等） | コピー&ペースト方式でカスタマイズ自由、Tailwind 統合 |
| nanoid（非 UUID） | 短い ID（10文字）で URL フレンドリー |
| pnpm（非 npm/yarn） | 高速、ディスク効率、strict な依存解決 |

---
_標準とパターンを記述し、すべての依存関係を列挙するものではない_
