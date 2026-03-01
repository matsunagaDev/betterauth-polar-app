# プロジェクト構造

## 設計方針

機能優先（Feature-first）+ レイヤー分離。`app/` でルーティング、`components/features/` で機能 UI、`trpc/` で API、`db/` でデータ層を分離する。

## ディレクトリパターン

### ページ
**場所**: `app/`
**目的**: Next.js App Router のルーティングとページコンポーネント
**例**: `app/(auth)/sign-in/page.tsx`, `app/page.tsx`, `app/onboarding/page.tsx`

### ルートグループ
**場所**: `app/(group-name)/`
**目的**: URL に影響しないレイアウト共有グループ
**例**: `app/(auth)/` -- 認証ページ共通レイアウト（`layout.tsx` を持つ）

### API ハンドラ
**場所**: `app/api/`
**目的**: Better Auth と tRPC のエンドポイント
**例**: `app/api/auth/[...all]/route.ts`, `app/api/trpc/[trpc]/route.ts`

### 機能コンポーネント
**場所**: `components/features/{feature-name}/`
**目的**: 特定機能に紐づく UI コンポーネント
**例**: `components/features/auth/sign-in-view.tsx`, `components/features/home/subscription-buttons.tsx`, `components/features/onboarding/onboarding-view.tsx`

### UI コンポーネント
**場所**: `components/ui/`
**目的**: shadcn/ui の再利用可能なプリミティブ（ビジネスロジックなし）
**例**: `components/ui/button.tsx`, `components/ui/card.tsx`

### tRPC ルーター
**場所**: `trpc/routers/`
**目的**: 型安全な API プロシージャ定義
**例**: `trpc/routers/_app.ts`（ルートルーター）, `trpc/routers/genre.ts`, `trpc/routers/onboarding.ts`

### tRPC 基盤
**場所**: `trpc/`
**目的**: コンテキスト、プロシージャ定義、クライアント/サーバーセットアップ
**例**: `trpc/init.ts`（baseProcedure / protectedProcedure / subscribeProcedure）

### DB スキーマ
**場所**: `db/schemas/`
**目的**: Drizzle ORM テーブル定義とリレーション
**例**: `db/schemas/auth.ts`（認証テーブル群）, `db/schemas/genres.ts`（ジャンルテーブル）

### DB インスタンス
**場所**: `db/index.ts`
**目的**: Drizzle クライアント初期化。全スキーマをここで集約して登録する
**パターン**: `import * as xxxSchemas` で各スキーマを取り込み、`schema` オプションにスプレッド

### ライブラリ
**場所**: `lib/`
**目的**: 認証設定、外部 SDK クライアント、ユーティリティ
**例**: `lib/auth.ts`（サーバー側）, `lib/auth-client.ts`（クライアント側）, `lib/polar-client.ts`

### カスタムフック
**場所**: `hooks/`
**目的**: React カスタムフック（クライアント側ロジック）
**例**: `hooks/use-active-subscription.ts`, `hooks/use-safe-logout.ts`

### マイグレーション
**場所**: `migrations/`
**目的**: Drizzle Kit が自動生成するマイグレーションファイル
**管理**: `pnpm drizzle-kit generate` で生成、`pnpm drizzle-kit migrate` で適用

### E2E テスト
**場所**: `e2e/`
**目的**: Playwright E2E テストファイル
**例**: `e2e/onboarding.spec.ts`

### ドキュメント
**場所**: `docs/`
**目的**: プロジェクト計画書や設計ドキュメント（.gitignore で除外）
**例**: `docs/PLAN.md`（実装ロードマップ）, `docs/youtube-api-integration.md`

## 命名規則

- **ファイル**: kebab-case（`sign-in-view.tsx`, `use-safe-logout.ts`）
- **コンポーネント**: PascalCase（`SubscriptionButtons`, `SignInView`）
- **関数/フック**: camelCase（`useSafeLogout`）-- フック名は `use` プレフィックス
- **DB カラム**: snake_case（`user_id`, `created_at`）
- **テーブル**: 複数形（`users`, `sessions`, `posts`）

## インポート規則

```typescript
// 絶対パス（@/ エイリアス）を優先
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { Button } from '@/components/ui/button';

// 相対パスは同ディレクトリ内のみ
import { videosRouter } from './videos';
```

**パスエイリアス**:
- `@/` → プロジェクトルート（tsconfig.json の `paths` で定義）

## コード構成の原則

1. **サーバー/クライアント分離** -- `"use client"` は必要なコンポーネントのみ。ページはデフォルトでサーバーコンポーネント
2. **認証階層** -- `baseProcedure` → `protectedProcedure` → `subscribeProcedure` の順に制約が強くなる
3. **スキーマ駆動** -- DB スキーマ → tRPC ルーター → UI の順で実装する
4. **コロケーション** -- 機能に関連するコンポーネントは `components/features/{name}/` に集約
5. **server-only / client-only** -- サーバー専用モジュールには `server-only`、クライアント専用には `client-only` パッケージで境界を明示

## 注意事項

- ルートルーターのファイル名は `_app.ts`（アンダースコアプレフィックス）
- `db/schemas/posts.ts` は削除済み（未使用のため）

---
_パターンを記述する。新しいファイルがパターンに従えば、このドキュメントの更新は不要_
