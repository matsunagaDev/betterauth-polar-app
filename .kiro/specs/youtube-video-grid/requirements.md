# Requirements Document

## Introduction
メインページにYouTube動画をグリッド形式で表示する機能の要件定義。YouTube Data API v3を使用して動画データを自動取得し、tRPCルーターを通じてクライアントに提供する。動画の再生には`@next/third-parties/google`のYouTubeEmbedコンポーネントを使用する。ユーザーがオンボーディングで選択したジャンルに基づくパーソナライズ動画と、全体の人気動画を組み合わせて表示する。

## Requirements

### Requirement 1: YouTube動画データ取得
**Objective:** As a システム管理者, I want YouTube Data API v3から動画データを自動的に取得したい, so that ユーザーに最新の動画コンテンツを提供できる

#### Acceptance Criteria
1. The Video Service shall YouTube Data API v3を使用して動画データ（タイトル、サムネイル、動画ID、チャンネル名、公開日、再生回数）を取得する
2. When 動画データの取得リクエストが発行された時, the Video Service shall APIレスポンスをアプリケーションで使用可能な形式に変換して返却する
3. If YouTube Data API v3への接続が失敗した場合, the Video Service shall エラー情報をログに記録し、クライアントに適切なエラーメッセージを返却する
4. If YouTube Data API v3のクォータ上限に達した場合, the Video Service shall クォータ超過を示すエラーをクライアントに返却する

### Requirement 2: tRPCルーターによる動画API提供
**Objective:** As a フロントエンド開発者, I want tRPCルーターを通じて型安全に動画データを取得したい, so that クライアント側で型の整合性を保ちながら動画データを利用できる

#### Acceptance Criteria
1. The Video Router shall 動画一覧を取得するためのtRPCプロシージャを提供する
2. The Video Router shall 動画データのレスポンス型をZodスキーマで定義し、型安全な入出力を保証する
3. When クライアントが動画一覧プロシージャを呼び出した時, the Video Router shall ジャンルカテゴリに基づいてフィルタリングされた動画データを返却する
4. When クライアントが人気動画プロシージャを呼び出した時, the Video Router shall 再生回数または人気度に基づいてソートされた動画データを返却する

### Requirement 3: ジャンルベースの動画パーソナライズ
**Objective:** As a ログインユーザー, I want オンボーディングで選択したジャンルに基づく動画を見たい, so that 自分の興味に合ったコンテンツを効率的に発見できる

#### Acceptance Criteria
1. When ユーザーがメインページにアクセスした時, the Video Service shall ユーザーのオンボーディングで選択されたジャンル情報を取得する
2. When ジャンル情報が取得できた時, the Video Service shall 選択されたジャンルに対応するYouTube動画を取得して表示用データとして返却する
3. If ユーザーがジャンルを未選択の場合, the Video Service shall デフォルトのジャンルまたは人気動画をフォールバックとして返却する
4. When ユーザーが複数のジャンルを選択している時, the Video Service shall 各ジャンルからバランスよく動画を取得して返却する

### Requirement 4: 人気動画の表示
**Objective:** As a ユーザー, I want 人気のある動画を一覧で確認したい, so that トレンドや話題のコンテンツを把握できる

#### Acceptance Criteria
1. The Video Service shall 人気動画のセクションをメインページに表示するためのデータを提供する
2. When メインページが読み込まれた時, the Video Service shall 人気度の高い動画データを取得して返却する
3. The Video Service shall ジャンルベースの動画セクションとは別に人気動画セクションのデータを提供する

### Requirement 5: 動画グリッドUI表示
**Objective:** As a ユーザー, I want 動画をグリッドレイアウトで一覧表示したい, so that 複数の動画を視覚的に比較しながら視聴する動画を選べる

#### Acceptance Criteria
1. The Video Grid shall 動画をレスポンシブなグリッドレイアウトで表示する
2. The Video Grid shall 各動画カードにサムネイル画像、タイトル、チャンネル名を表示する
3. While 動画データを読み込み中の間, the Video Grid shall ローディング状態を視覚的に表示する
4. If 表示可能な動画が存在しない場合, the Video Grid shall 動画が見つからないことを示すメッセージを表示する
5. The Video Grid shall ジャンル別セクションと人気動画セクションを区別可能な見出しまたはラベル付きで表示する

### Requirement 6: YouTube動画再生
**Objective:** As a ユーザー, I want グリッドから選択した動画をその場で再生したい, so that ページ遷移なしにスムーズに動画を視聴できる

#### Acceptance Criteria
1. When ユーザーが動画カードをクリックした時, the Video Grid shall `@next/third-parties/google`のYouTubeEmbedコンポーネントを使用して動画を再生表示する
2. The YouTubeEmbed shall 動画IDを受け取りYouTubeプレーヤーを埋め込み表示する
3. When ユーザーが再生中の動画を閉じる操作を行った時, the Video Grid shall 動画再生を停止しグリッド一覧の表示に戻る

### Requirement 7: 未認証ユーザーへの対応
**Objective:** As a 未認証ユーザー, I want ログインしていなくても動画の一覧を閲覧したい, so that サービスの内容を確認した上で登録を検討できる

#### Acceptance Criteria
1. When 未認証ユーザーがメインページにアクセスした時, the Video Grid shall 人気動画セクションを表示する
2. While ユーザーが未認証の状態の間, the Video Grid shall ジャンルベースのパーソナライズ動画セクションを非表示にする、またはログインを促すメッセージを表示する
