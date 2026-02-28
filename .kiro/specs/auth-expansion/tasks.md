# Implementation Plan

## Scope

Google OAuth 認証（Requirement 1）およびサインインページ統合（Requirement 5 の Google 関連部分）のみを対象とする。

## Tasks

- [x] 1. Google OAuth 環境変数の追加
  - `.env.example` に `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` のエントリを追加する
  - Google Cloud Console での OAuth クライアント作成・リダイレクト URI 設定に必要な情報をコメントで補足する
  - サーバー設定（`lib/auth.ts`）は既に `socialProviders.google` を参照済みのため、環境変数の定義のみで認証フローが有効になることを確認する
  - _Requirements: 1.1, 1.2_

- [ ] 2. サインインページに Google OAuth ボタンを追加
- [x] 2.1 (P) Google アイコンコンポーネントの用意
  - lucide-react に Google アイコンが含まれないため、SVG ベースの Google アイコンコンポーネントを作成する
  - 既存の GitHub アイコン（`lucide-react` の `Github`）と同等のサイズ・スタイルで統一する
  - _Requirements: 1.1, 5.1_

- [x] 2.2 Google OAuth 認証ハンドラとボタンの実装
  - 既存の `handleGitHubSignIn` と同一パターンで `handleGoogleSignIn` を実装する（`provider: "google"` を指定）
  - `isLoading` 状態の共有管理により、認証フロー中は全ボタンを無効化する
  - エラー発生時は try/catch で捕捉し、toast 通知と error state の設定を行う（GitHub OAuth と同一パターン）
  - サインインページの OAuth ボタン群に Google ボタンを追加し、Google アイコンを表示する
  - ボタン配置は既存の GitHub OAuth ボタンと同一の UI パターン（`variant="outline"`、フル幅）を維持する
  - _Requirements: 1.1, 1.3, 5.1, 5.2_

- [ ] 3. Google OAuth 認証フローの動作検証
  - 開発環境で Google OAuth の認可フロー全体を通して動作確認する（サインインページ → Google ログイン画面 → コールバック → セッション確立 → リダイレクト）
  - 新規ユーザーが Google OAuth でサインアップした場合にアカウントが正しく作成されることを確認する
  - 既に同じメールアドレスで登録済みのユーザーが Google OAuth でログインした場合に、既存アカウントに Google プロバイダーが紐付けされることを確認する
  - Google OAuth 画面でキャンセルした場合やエラー発生時に、サインインページへリダイレクトされエラーメッセージが表示されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 4. Google OAuth のテストカバレッジ
  - `handleGoogleSignIn` が `signIn.social` を `provider: "google"` で呼び出すことをユニットテストで検証する
  - `isLoading` 中に全認証ボタンが disabled になることを検証する
  - エラーハンドリング（catch ブロックで toast と error state が設定される）を検証する
  - サインインページにゲスト、メール/パスワード、GitHub、Google の各認証ボタンが正しく表示されることを検証する
  - _Requirements: 1.1, 1.3, 5.1, 5.2_
