/**
 * アプリ内ジャンルID（DBの genres.id）→ YouTube search.list API の検索キーワード（q）変換
 * @see .kiro/specs/youtube-video-grid/design.md - GenreMapping
 */

interface YouTubeSearchParams {
  searchQuery: string;
}

const GENRE_MAP: Record<string, YouTubeSearchParams> = {
  action: { searchQuery: "アクション映画 予告" },
  comedy: { searchQuery: "コメディ 面白い" },
  drama: { searchQuery: "ドラマ 感動" },
  horror: { searchQuery: "ホラー映画 怖い" },
  "sci-fi": { searchQuery: "SF 映画 サイエンスフィクション" },
  romance: { searchQuery: "恋愛映画 ラブストーリー" },
  anime: { searchQuery: "アニメ PV 予告" },
  documentary: { searchQuery: "ドキュメンタリー" },
  thriller: { searchQuery: "スリラー映画 サスペンス" },
  fantasy: { searchQuery: "ファンタジー映画" },
};

const DEFAULT_PARAMS: YouTubeSearchParams = {
  searchQuery: "おすすめ",
};

export function getYouTubeParams(genreId: string): YouTubeSearchParams {
  return GENRE_MAP[genreId] ?? DEFAULT_PARAMS;
}

export function isGenreSupported(genreId: string): boolean {
  return genreId in GENRE_MAP;
}

export function getDefaultParams(): YouTubeSearchParams {
  return DEFAULT_PARAMS;
}
