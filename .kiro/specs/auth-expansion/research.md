# Research & Design Decisions

## Summary
- **Feature**: `auth-expansion` (オンボーディング スコープ)
- **Discovery Scope**: Extension (既存 Better Auth + tRPC 基盤へのオンボーディングフロー追加)
- **Key Findings**:
  - `users` テーブルにオンボーディング完了フラグとジャンル情報を追加する方式が最小変更で実現可能
  - Next.js App Router のミドルウェアまたはサーバーコンポーネントでオンボーディング未完了ユーザーのリダイレクトを制御可能
  - tRPC の `protectedProcedure` を活用してオンボーディング API を構築し、既存の認証階層と一貫性を保つ

## Research Log

### オンボーディングフローの設計パターン
- **Context**: 初回ログイン後にユーザーをオンボーディング画面へ誘導し、ジャンル選択を促すフローの設計方式を調査
- **Sources Consulted**: Next.js App Router ドキュメント、既存プロジェクトコードベース
- **Findings**:
  - Next.js のサーバーコンポーネント（`page.tsx`）でセッション取得時にオンボーディング完了フラグを確認し、未完了なら `/onboarding` へ `redirect()` する方式がシンプル
  - Next.js Middleware (`middleware.ts`) でリダイレクトする方式も可能だが、セッション情報の取得に Better Auth の API 呼び出しが必要でパフォーマンスの懸念がある
  - 既存の `app/page.tsx` が既にサーバーコンポーネントで `auth.api.getSession` を呼び出してリダイレクト制御を行っているため、同パターンの拡張が自然
- **Implications**: サーバーコンポーネントでのリダイレクト方式を採用。Middleware は使用しない

### ジャンルデータの管理方式
- **Context**: ジャンル一覧の定義方法と、ユーザーが選択したジャンルの保存方式を検討
- **Sources Consulted**: Drizzle ORM ドキュメント、SQLite の JSON サポート、既存スキーマ定義
- **Findings**:
  - ジャンルマスターデータ: 初期段階ではコード内の定数配列として定義する方式が適切。将来的にジャンルの動的管理が必要になった際にテーブル化を検討
  - ユーザー選択ジャンルの保存: SQLite は JSON 型をサポートしており、`users` テーブルに `genres` カラム（JSON テキスト）を追加する方式で対応可能
  - 別テーブル（`user_genres` 中間テーブル）方式も検討したが、ジャンル数が限定的でクエリの複雑さに見合わない
  - Drizzle ORM で `text("genres")` + アプリケーション層での JSON パース/シリアライズが現実的
- **Implications**: `users` テーブルに `genres`（JSON テキスト）と `onboarding_completed`（boolean）カラムを追加する方式を採用

### Better Auth の追加フィールド管理
- **Context**: Better Auth が管理する `users` テーブルにカスタムフィールドを追加する方法を確認
- **Sources Consulted**: Better Auth ドキュメント、Drizzle ORM スキーマ定義
- **Findings**:
  - Better Auth は `users` テーブルのスキーマを Drizzle の定義から自動推論する。追加カラムは Drizzle スキーマに定義すれば Better Auth の動作に影響しない
  - Better Auth の `user` オブジェクトには追加カラムがデフォルトでは含まれないため、tRPC プロシージャ内で Drizzle ORM を使って直接クエリする必要がある
  - セッションの `user` オブジェクトにカスタムフィールドを含めるには Better Auth の `additionalFields` 設定が必要だが、今回はオンボーディング状態の確認を tRPC 経由で行うため不要
- **Implications**: Drizzle スキーマに直接カラムを追加し、tRPC プロシージャ内で Drizzle ORM を使ってクエリする

### 認証コールバック後のリダイレクト先制御
- **Context**: OAuth 認証完了後のリダイレクト先をオンボーディング完了状態に応じて制御する方法を調査
- **Sources Consulted**: Better Auth ドキュメント、既存の `signIn.social` 呼び出しパターン
- **Findings**:
  - 現在の `callbackURL` は `"/"` 固定。OAuth コールバック処理は Better Auth サーバー内で完結するため、コールバック時点でオンボーディング状態を判定してリダイレクト先を動的に変更するのは困難
  - 代替案: `callbackURL` は `"/"` のままとし、`app/page.tsx`（ホームページ）のサーバーコンポーネントでオンボーディング未完了を検知して `/onboarding` へリダイレクトする。この方式は追加リダイレクトが 1 回発生するが、実装がシンプルで保守性が高い
  - もう一つの代替案: `callbackURL` を `/onboarding` に固定し、オンボーディング画面側で完了済みユーザーをホームにリダイレクトする。これは全ログインでオンボーディングページを経由するため不効率
- **Implications**: `callbackURL` は `"/"` のままとし、保護ページのサーバーコンポーネントでオンボーディング状態を確認してリダイレクトする方式を採用

## Design Decisions

### Decision: オンボーディング状態の保存方式
- **Context**: ユーザーのオンボーディング完了状態と選択ジャンルの永続化方式を決定する
- **Alternatives Considered**:
  1. `users` テーブルに `onboarding_completed` と `genres` カラムを追加
  2. 別テーブル `user_profiles` を新設してオンボーディング情報を格納
  3. 別テーブル `user_genres`（中間テーブル）でジャンル選択を管理
- **Selected Approach**: `users` テーブルに直接カラムを追加
- **Rationale**: オンボーディング完了フラグはユーザーの基本属性であり、頻繁にアクセスされる情報。JOIN なしで取得できる方が効率的。ジャンルデータも 1 ユーザーあたり数件程度で、JSON テキストでの保存が適切
- **Trade-offs**: `users` テーブルのカラム数が増加するが、データ量は最小限。将来的にプロフィール情報が大幅に増加した場合は別テーブルへの分離を検討
- **Follow-up**: Drizzle マイグレーションの生成と適用が必要

### Decision: オンボーディングリダイレクトの実装方式
- **Context**: オンボーディング未完了ユーザーを適切にオンボーディング画面へ誘導する方法を決定する
- **Alternatives Considered**:
  1. Next.js Middleware でリクエストごとにセッションとオンボーディング状態を確認
  2. 保護ページのサーバーコンポーネントでオンボーディング状態を確認してリダイレクト
  3. クライアントサイドで `useEffect` を使ってリダイレクト
- **Selected Approach**: 保護ページのサーバーコンポーネントでオンボーディング状態を確認
- **Rationale**: 既存の `app/page.tsx` が同パターンでセッション確認とリダイレクトを実装済み。Middleware は Better Auth のセッション取得 API 呼び出しが必要でパフォーマンスの懸念あり。クライアントサイドリダイレクトは FOUC（Flash of Unstyled Content）が発生する
- **Trade-offs**: 保護ページが増えるたびにオンボーディングチェックのロジックを記述する必要がある。共通レイアウトでの一括チェックで緩和可能
- **Follow-up**: 保護ページ群の共通レイアウトにオンボーディングチェックを組み込む設計を検討

### Decision: ジャンルマスターデータの管理方式
- **Context**: 選択可能なジャンル一覧の定義と管理方法を決定する
- **Alternatives Considered**:
  1. コード内定数配列として定義
  2. DB テーブル（`genres` マスターテーブル）で管理
  3. 環境変数または設定ファイルで管理
- **Selected Approach**: コード内定数配列として定義
- **Rationale**: 初期段階ではジャンル一覧が固定的であり、DB テーブル化のオーバーヘッドに見合わない。型安全性が高く、フロントエンドとバックエンドで共有可能。将来的にジャンルの動的管理が必要になった場合にテーブル化へ移行する
- **Trade-offs**: ジャンルの追加・変更にはコードデプロイが必要。運用チームによるジャンル管理は不可
- **Follow-up**: ジャンル定義を共有モジュール（`lib/constants/genres.ts` 等）に配置

## Risks & Mitigations
- `users` テーブルへのカラム追加に伴うマイグレーション -- Drizzle Kit の `generate` + `migrate` で管理。既存データへの影響なし（NULL 許容またはデフォルト値設定）
- オンボーディング未完了ユーザーが保護ページに直接アクセスした場合のリダイレクトループ -- `/onboarding` ページ自体はオンボーディングチェックの対象外とする。ルーティングロジックで明確に除外
- OAuth 認証後のリダイレクト時に追加リダイレクトが発生する -- UX への影響は最小限（数百ミリ秒）。将来的に Better Auth の `afterSignIn` フックで最適化可能

## References
- [Next.js App Router Redirect](https://nextjs.org/docs/app/api-reference/functions/redirect) -- サーバーコンポーネントでのリダイレクト方法
- [Drizzle ORM SQLite Schema](https://orm.drizzle.team/docs/column-types/sqlite) -- SQLite カラム型定義
- [Better Auth Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts) -- ユーザーモデルのカスタマイズ
