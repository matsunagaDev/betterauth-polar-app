# Research & Design Decisions

## Summary
- **Feature**: `youtube-video-grid`
- **Discovery Scope**: Extension（外部API統合を含む既存システムの拡張）
- **Key Findings**:
  - YouTube Data API v3の`search.list`は100ユニット/回のクォータコストで、デフォルト上限10,000ユニット/日の制約がある。`videos.list`（`chart=mostPopular`）は1ユニット/回で大幅に効率的
  - `@next/third-parties/google`のYouTubeEmbedは`lite-youtube-embed`ベースで高速読み込みを実現。propsは`videoid`（必須）、`width`、`height`、`params`、`style`、`playlabel`
  - ユーザーのジャンルデータは`users.genres`カラムにJSON文字列として格納済み。ジャンルIDからYouTubeカテゴリへのマッピングが必要

## Research Log

### YouTube Data API v3 クォータ戦略
- **Context**: 動画データ取得のAPI選択とクォータ効率化
- **Sources Consulted**:
  - [Search: list | YouTube Data API](https://developers.google.com/youtube/v3/docs/search/list)
  - [Videos: list | YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/list)
  - [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- **Findings**:
  - `search.list`: クォータコスト100ユニット/回。`q`、`type`、`videoCategoryId`、`order`パラメータでフィルタ可能。`maxResults`は最大50件
  - `videos.list`: クォータコスト1ユニット/回。`chart=mostPopular`で人気動画取得可能。`regionCode`で地域フィルタ
  - `videoCategories.list`: クォータコスト1ユニット/回。`regionCode=JP`で日本向けカテゴリ取得可能
  - デフォルトクォータ: 10,000ユニット/日。search.listのみだと100回/日が上限
- **Implications**:
  - 人気動画は`videos.list(chart=mostPopular)`で取得（1ユニット）
  - ジャンル別動画は`search.list(videoCategoryId=X)`で取得（100ユニット）
  - クォータ節約のためサーバーサイドキャッシュが重要

### @next/third-parties YouTubeEmbed コンポーネント
- **Context**: 動画再生コンポーネントの技術仕様確認
- **Sources Consulted**:
  - [Next.js Third-Party Libraries Guide](https://nextjs.org/docs/app/guides/third-party-libraries)
  - [@next/third-parties npm](https://www.npmjs.com/package/@next/third-parties)
- **Findings**:
  - `lite-youtube-embed`を内部使用し、高速読み込みを実現
  - Props: `videoid`（必須）、`width`（デフォルト`auto`）、`height`（デフォルト`auto`）、`params`（プレーヤーパラメータ）、`style`、`playlabel`
  - 現在experimentalステータスだが、Next.js公式パッケージとして安定運用可能
  - `params`でYouTube Player Parametersを渡せる（例: `controls=0&start=10`）
- **Implications**:
  - クライアントコンポーネントとして使用する必要がある
  - lite-youtube-embedのため初期ロードが軽量（iframe遅延読み込み）

### 既存コードベースのジャンルデータ構造
- **Context**: ユーザーのジャンル選択データの取得方法
- **Sources Consulted**: 既存コードベース分析（`db/schemas/auth.ts`、`trpc/routers/onboarding.ts`）
- **Findings**:
  - `users.genres`カラムにJSON文字列として`string[]`（ジャンルID配列）を格納
  - `genres`テーブルに`id`と`label`のみ（YouTubeカテゴリIDとの紐付けなし）
  - オンボーディングで最大3ジャンルを選択可能
  - `genreRouter.list`でジャンル一覧取得、`onboardingRouter.status`でユーザーのジャンル取得が可能
- **Implications**:
  - `genres`テーブルにYouTubeカテゴリIDまたは検索キーワードのマッピングカラムを追加する必要がある
  - または、アプリ側でジャンルID→YouTube検索クエリのマッピング定数を持つ方法もある

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| サーバーサイドAPI統合 | tRPCルーター内でYouTube API呼び出し | APIキー秘匿、クォータ管理一元化 | サーバー負荷集中 | 既存パターンに合致 |
| クライアント直接呼び出し | フロントからYouTube API直接 | サーバー負荷なし | APIキー露出リスク、CORS | セキュリティ上不適 |
| BFF + キャッシュ | tRPCルーター + インメモリキャッシュ | クォータ効率化、レスポンス高速化 | キャッシュ無効化の複雑さ | **採用**: バランス最適 |

## Design Decisions

### Decision: YouTube APIのクォータ最適化戦略
- **Context**: デフォルト10,000ユニット/日の制約下でAPI呼び出しを効率化する必要
- **Alternatives Considered**:
  1. リクエスト毎にAPI呼び出し -- シンプルだがクォータ枯渇リスク大
  2. サーバーサイドインメモリキャッシュ + TTL -- クォータ節約、実装適度
  3. DB永続キャッシュ -- 完全なクォータ制御だがスキーマ追加の複雑さ
- **Selected Approach**: サーバーサイドインメモリキャッシュ（Map + TTL）
- **Rationale**: MVP段階では単一サーバーインスタンスが前提。Map + TTLでシンプルに実装でき、クォータ消費を大幅削減。将来の拡張でRedis等に移行可能
- **Trade-offs**: サーバー再起動でキャッシュクリア / 複数インスタンスでキャッシュ不整合
- **Follow-up**: キャッシュヒット率とクォータ消費量のモニタリング

### Decision: ジャンル→YouTube検索マッピング方式
- **Context**: アプリ内ジャンルIDをYouTube API検索パラメータに変換する方法
- **Alternatives Considered**:
  1. `genres`テーブルにYouTubeカテゴリIDカラム追加 -- DB変更必要
  2. アプリ定数としてマッピングオブジェクト定義 -- DB変更不要、柔軟
- **Selected Approach**: アプリ定数としてマッピング定義（`lib/youtube/genre-mapping.ts`）
- **Rationale**: YouTube APIの検索はカテゴリIDだけでなく検索キーワード（`q`パラメータ）との組み合わせが有効。定数マップの方が`videoCategoryId`と`q`の両方を管理しやすい。DBスキーマ変更を回避しシンプルさを維持
- **Trade-offs**: マッピング変更にデプロイが必要 / ランタイム変更不可
- **Follow-up**: ジャンル数が増加した場合はDB管理への移行を検討

### Decision: 未認証ユーザーの動画表示方針
- **Context**: 未認証ユーザーにも人気動画を表示しつつ、パーソナライズはログインユーザーに限定
- **Selected Approach**: `baseProcedure`で人気動画取得、`protectedProcedure`でジャンル別動画取得のプロシージャ分離
- **Rationale**: 既存のtRPCプロシージャ階層（base/protected/subscribe）に合致。認証不要の人気動画と認証必須のパーソナライズを明確に分離

## Risks & Mitigations
- YouTube Data APIクォータ枯渇 -- インメモリキャッシュ（TTL: 30分〜1時間）でAPI呼び出し頻度を削減
- YouTube APIレスポンス遅延 -- タイムアウト設定とローディング状態のUI表示
- lite-youtube-embedのexperimentalステータス -- Next.js公式パッケージであり安定性は十分。代替としてiframe直埋め込みが可能
- ジャンルマッピングの不整合 -- マッピング定数にバリデーション関数を用意し、未マッピングジャンルはフォールバック

## References
- [YouTube Data API v3 - Search: list](https://developers.google.com/youtube/v3/docs/search/list) -- search.listのパラメータとレスポンス構造
- [YouTube Data API v3 - Videos: list](https://developers.google.com/youtube/v3/docs/videos/list) -- videos.listのパラメータとクォータコスト
- [YouTube Data API Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost) -- クォータコスト計算
- [Next.js Third-Party Libraries Guide](https://nextjs.org/docs/app/guides/third-party-libraries) -- YouTubeEmbedコンポーネントの公式ドキュメント
- [@next/third-parties npm](https://www.npmjs.com/package/@next/third-parties) -- パッケージ情報
