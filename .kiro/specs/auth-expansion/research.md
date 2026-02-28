# Research & Design Decisions

## Summary
- **Feature**: `auth-expansion` (Google OAuth スコープ)
- **Discovery Scope**: Extension (既存 Better Auth 基盤への OAuth プロバイダー追加)
- **Key Findings**:
  - サーバー側の Google OAuth 設定は `lib/auth.ts` に既に存在する (`socialProviders.google`)
  - Better Auth はメールアドレス一致による自動アカウントリンクをデフォルトでサポートする
  - コールバック URL は `/api/auth/callback/google` の形式で Better Auth が自動処理する

## Research Log

### Better Auth Google OAuth 設定
- **Context**: Google OAuth を既存の Better Auth 基盤に統合する方法を調査
- **Sources Consulted**:
  - [Google | Better Auth](https://www.better-auth.com/docs/authentication/google)
  - [OAuth | Better Auth](https://www.better-auth.com/docs/concepts/oauth)
- **Findings**:
  - `socialProviders.google` に `clientId` / `clientSecret` を設定するだけで基本動作する
  - クライアント側は `authClient.signIn.social({ provider: "google" })` で呼び出す
  - Google Cloud Console に登録するリダイレクト URI: `http://localhost:3000/api/auth/callback/google`（開発時）、`https://your-domain.com/api/auth/callback/google`（本番時）
  - `prompt: "select_account"` オプションでアカウント選択を強制可能
  - `accessType: "offline"` でリフレッシュトークンを取得可能（今回は不要）
- **Implications**: サーバー側設定は既に完了しており、環境変数の追加とクライアント側 UI の変更のみで動作する

### アカウントリンク動作
- **Context**: 同一メールアドレスで複数プロバイダーからログインした場合の挙動を確認
- **Sources Consulted**:
  - [User & Accounts | Better Auth](https://www.better-auth.com/docs/concepts/users-accounts)
  - [OAuth | Better Auth](https://www.better-auth.com/docs/concepts/oauth)
- **Findings**:
  - Better Auth はデフォルトでアカウントリンクが有効
  - 同一メールアドレスの場合、プロバイダーがメール検証済みであれば自動的にリンクする
  - Google はメール検証済みを返すため、自動リンクが動作する
  - `trustedProviders` を設定するとメール未検証でもリンク可能（今回は不要）
  - `accounts` テーブルに `provider_id: "google"` / `account_id: "<google-user-id>"` のレコードが作成される
- **Implications**: 追加の実装なしで要件 1.4（既存アカウントとの紐付け）を満たせる

### 既存実装の分析
- **Context**: 現在のサインインページとGitHub OAuth の実装パターンを把握
- **Sources Consulted**: プロジェクトソースコード
- **Findings**:
  - `lib/auth.ts`: `socialProviders.google` が既に定義済み（環境変数参照あり）
  - `lib/auth-client.ts`: `signIn.social` メソッドが利用可能（GitHub で実証済み）
  - `components/features/auth/sign-in-view.tsx`: GitHub OAuth ボタンが実装済み。同パターンで Google ボタンを追加可能
  - `.env.example`: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が未定義
  - `db/schemas/auth.ts`: `accounts` テーブルは既にプロバイダー情報を格納する構造
  - エラーハンドリングは GitHub OAuth と同一パターン（try/catch + toast）を踏襲する
- **Implications**: 既存パターンの踏襲で実装工数を最小化できる。スキーマ変更は不要

## Design Decisions

### Decision: Google OAuth の実装アプローチ
- **Context**: Google OAuth を最小限の変更で既存基盤に統合する
- **Alternatives Considered**:
  1. Better Auth の `socialProviders` を利用（現在の GitHub OAuth と同一パターン）
  2. カスタム OAuth フローを独自実装
- **Selected Approach**: Better Auth の `socialProviders` を利用
- **Rationale**: サーバー側設定が既に存在し、GitHub OAuth と同一パターンで実装可能。Better Auth がコールバック処理、トークン管理、アカウントリンクを自動で行うため、追加コードが最小限で済む
- **Trade-offs**: Better Auth の OAuth 実装に依存するが、既に GitHub OAuth で実績がありリスクは低い
- **Follow-up**: Google Cloud Console での OAuth クライアント設定、リダイレクト URI の登録

### Decision: UI コンポーネントの変更方針
- **Context**: サインインページに Google OAuth ボタンを追加する方法
- **Alternatives Considered**:
  1. 既存の `SignInView` コンポーネントに直接ボタンを追加
  2. OAuth ボタン群を専用コンポーネントに分離
- **Selected Approach**: 既存の `SignInView` コンポーネントに直接追加
- **Rationale**: 現時点では OAuth プロバイダーが 2 つ（GitHub + Google）で、専用コンポーネントへの分離は過剰。将来 LINE 認証追加時にリファクタリングを検討する
- **Trade-offs**: コンポーネントが若干肥大化するが、現状の規模では許容範囲
- **Follow-up**: Requirement 2（LINE 認証）実装時に OAuth ボタン群の共通化を検討

## Risks & Mitigations
- Google Cloud Console の OAuth 同意画面設定が不完全な場合、認証フローが動作しない -- 環境構築手順をドキュメント化
- Google OAuth のレート制限（10,000 リクエスト/日）-- 現段階では問題なし、スケール時に再評価
- 匿名ユーザーから Google OAuth への切り替え時のアカウントリンク -- Better Auth の anonymous プラグインが linkAccount をサポートするか要確認

## References
- [Google | Better Auth](https://www.better-auth.com/docs/authentication/google) -- Google OAuth プロバイダー設定ガイド
- [OAuth | Better Auth](https://www.better-auth.com/docs/concepts/oauth) -- OAuth フロー概要、コールバック処理
- [User & Accounts | Better Auth](https://www.better-auth.com/docs/concepts/users-accounts) -- アカウントリンク動作、trustedProviders
- [Basic Usage | Better Auth](https://www.better-auth.com/docs/basic-usage) -- クライアント側 signIn.social メソッド
