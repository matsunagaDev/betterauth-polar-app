# Requirements Document

## Introduction

本ドキュメントは「認証拡充（auth-expansion）」機能の要件を定義する。既存の Better Auth 基盤（メール/パスワード、GitHub OAuth、匿名ログイン）に Google 認証・LINE 認証を追加し、プロフィール編集機能およびオンボーディングフローを実装する。すべての機能は tRPC のプロシージャ階層（base/protected/subscribe）に統合する。

## Requirements

### Requirement 1: Google OAuth 認証

**Objective:** ユーザーとして、Google アカウントでログインしたい。メール/パスワードを別途管理する手間を省くため。

#### Acceptance Criteria

1. When ユーザーがサインインページで「Google でログイン」ボタンをクリックした, the Auth Module shall Google OAuth 認可フローを開始し、Google のログイン画面へリダイレクトする
2. When Google OAuth の認可コールバックを正常に受信した, the Auth Module shall ユーザーアカウントを作成または既存アカウントと紐付けし、セッションを確立してアプリケーションへリダイレクトする
3. If Google OAuth の認可コールバックでエラーが発生した, the Auth Module shall サインインページへリダイレクトし、エラーメッセージを表示する
4. When 既に同じメールアドレスで登録済みのユーザーが Google OAuth でログインした, the Auth Module shall 既存アカウントに Google プロバイダーを紐付けし、セッションを確立する

### Requirement 2: LINE 認証

**Objective:** ユーザーとして、LINE アカウントでログインしたい。日本のユーザーにとって最も身近な認証手段を利用するため。

#### Acceptance Criteria

1. When ユーザーがサインインページで「LINE でログイン」ボタンをクリックした, the Auth Module shall LINE OAuth 認可フローを開始し、LINE のログイン画面へリダイレクトする
2. When LINE OAuth の認可コールバックを正常に受信した, the Auth Module shall ユーザーアカウントを作成または既存アカウントと紐付けし、セッションを確立してアプリケーションへリダイレクトする
3. If LINE OAuth の認可コールバックでエラーが発生した, the Auth Module shall サインインページへリダイレクトし、エラーメッセージを表示する
4. When 既に同じメールアドレスで登録済みのユーザーが LINE OAuth でログインした, the Auth Module shall 既存アカウントに LINE プロバイダーを紐付けし、セッションを確立する

### Requirement 3: プロフィール編集

**Objective:** 認証済みユーザーとして、自分のプロフィール情報（アバター、表示名、興味ジャンル）を編集したい。他のユーザーに自分を表現し、パーソナライズされた体験を得るため。

#### Acceptance Criteria

1. While ユーザーが認証済みの状態で, when プロフィール編集ページにアクセスした, the Profile Service shall 現在のアバター画像、表示名、興味ジャンル設定を表示する
2. When ユーザーが表示名を入力して保存ボタンをクリックした, the Profile Service shall 表示名を更新し、成功メッセージを表示する
3. When ユーザーがアバター画像をアップロードした, the Profile Service shall 画像を検証・保存し、プロフィールに反映する
4. If アバター画像のファイルサイズまたはフォーマットが許可範囲外の場合, the Profile Service shall アップロードを拒否し、許可されるファイル条件を表示する
5. When ユーザーが興味ジャンルを選択して保存した, the Profile Service shall 選択されたジャンルをユーザープロフィールに保存する
6. If 未認証のユーザーがプロフィール編集エンドポイントにアクセスした, the Profile Service shall 認証エラーを返し、サインインページへリダイレクトする

### Requirement 4: オンボーディング（初回ログイン時のジャンル選択）

**Objective:** 新規ユーザーとして、初回ログイン時に興味のあるジャンルを選択したい。パーソナライズされたコンテンツ推薦を最初から受けるため。

#### Acceptance Criteria

1. When ユーザーが初回ログインを完了した, the Auth Module shall オンボーディング画面へリダイレクトする
2. While オンボーディング画面が表示されている状態で, the Onboarding Service shall 選択可能なジャンル一覧を表示する
3. When ユーザーが1つ以上のジャンルを選択して完了ボタンをクリックした, the Onboarding Service shall 選択されたジャンルをユーザープロフィールに保存し、オンボーディング完了フラグを設定する
4. When オンボーディングが完了した, the Onboarding Service shall メインページへリダイレクトする
5. While ユーザーがオンボーディング未完了の状態で, when アプリケーションの保護されたページにアクセスした, the Auth Module shall オンボーディング画面へリダイレクトする
6. When 既にオンボーディングを完了したユーザーがログインした, the Auth Module shall オンボーディングをスキップし、メインページへリダイレクトする
7. When ユーザーがオンボーディング画面でスキップを選択した, the Onboarding Service shall ジャンル未選択のままオンボーディング完了フラグを設定し、メインページへリダイレクトする

### Requirement 5: サインインページの OAuth プロバイダー統合表示

**Objective:** ユーザーとして、サインインページですべての認証オプション（メール/パスワード、GitHub、Google、LINE）を一覧で確認したい。好みの方法で簡単にログインするため。

#### Acceptance Criteria

1. The Sign-In Page shall メール/パスワードフォーム、GitHub、Google、LINE の各認証ボタンを表示する
2. While いずれかの OAuth 認証フローが進行中の状態で, the Sign-In Page shall ローディング状態を表示し、他の認証ボタンを無効化する
3. When ユーザーが匿名ログインからソーシャルログインに切り替えた, the Auth Module shall 匿名アカウントをソーシャルアカウントにリンクする

### Requirement 6: tRPC プロシージャ階層への統合

**Objective:** 開発者として、プロフィール関連のAPIがtRPCのプロシージャ階層（base/protected/subscribe）に統合されている状態にしたい。認証・認可の一貫性を維持するため。

#### Acceptance Criteria

1. The Profile Service shall protectedProcedure を使用してプロフィール取得・更新のエンドポイントを提供する
2. The Onboarding Service shall protectedProcedure を使用してオンボーディング状態の取得・更新のエンドポイントを提供する
3. The Profile Service shall ジャンル一覧取得を baseProcedure で提供する
4. While ユーザーが未認証の状態で, when protectedProcedure のエンドポイントにリクエストした, the tRPC Router shall UNAUTHORIZED エラーを返す
