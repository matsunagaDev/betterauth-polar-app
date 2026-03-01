/**
 * YouTube Data API v3 通信サービス
 * @see .kiro/specs/youtube-video-grid/design.md - YouTubeVideoService
 */
import "server-only";
import { videoCache } from "./video-cache";

export interface VideoItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  publishedAt: string;
  viewCount: string | null;
}

export type YouTubeApiErrorCode =
  | "NETWORK_ERROR"
  | "QUOTA_EXCEEDED"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export interface YouTubeApiError {
  code: YouTubeApiErrorCode;
  message: string;
  statusCode: number | null;
}

export type VideoServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: YouTubeApiError };

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30分

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }
  return key;
}

function classifyError(error: unknown, statusCode: number | null): YouTubeApiError {
  if (error instanceof TypeError && (error as Error).message.includes("fetch")) {
    return { code: "NETWORK_ERROR", message: "YouTube APIへの接続に失敗しました", statusCode };
  }

  if (statusCode === 403) {
    return { code: "QUOTA_EXCEEDED", message: "YouTube APIのクォータ上限に達しました", statusCode };
  }

  if (statusCode !== null && statusCode >= 400) {
    return { code: "UNKNOWN", message: `YouTube APIエラー (${statusCode})`, statusCode };
  }

  return {
    code: "NETWORK_ERROR",
    message: error instanceof Error ? error.message : "不明なエラーが発生しました",
    statusCode,
  };
}

function transformVideoItem(item: Record<string, unknown>): VideoItem | null {
  const snippet = item.snippet as Record<string, unknown> | undefined;
  if (!snippet) return null;

  const title = snippet.title as string | undefined;
  const channelTitle = snippet.channelTitle as string | undefined;
  const publishedAt = snippet.publishedAt as string | undefined;

  if (!title || !channelTitle) return null;

  const thumbnails = snippet.thumbnails as Record<string, unknown> | undefined;
  const medium = thumbnails?.medium as Record<string, unknown> | undefined;
  const defaultThumb = thumbnails?.default as Record<string, unknown> | undefined;
  const thumbnailUrl = (medium?.url ?? defaultThumb?.url ?? "") as string;

  // videos.list: item.id = string / search.list: item.id = { videoId: string }
  let videoId: string;
  if (typeof item.id === "string") {
    videoId = item.id;
  } else if (typeof item.id === "object" && item.id !== null) {
    videoId = (item.id as Record<string, unknown>).videoId as string;
  } else {
    return null;
  }

  const statistics = item.statistics as Record<string, unknown> | undefined;
  const viewCount = (statistics?.viewCount as string) ?? null;

  return {
    videoId,
    title,
    thumbnailUrl,
    channelName: channelTitle,
    publishedAt: publishedAt ?? "",
    viewCount,
  };
}

/** 人気動画取得: YouTube videos.list API (chart=mostPopular) */
export async function fetchPopularVideos(params: {
  maxResults: number;
  regionCode: string;
}): Promise<VideoServiceResult<VideoItem[]>> {
  const cacheKey = `popular:${params.regionCode}:${params.maxResults}`;
  const cached = videoCache.get<VideoItem[]>(cacheKey);
  if (cached) return { success: true, data: cached };

  try {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("chart", "mostPopular");
    url.searchParams.set("regionCode", params.regionCode);
    url.searchParams.set("maxResults", String(params.maxResults));
    url.searchParams.set("key", getApiKey());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = classifyError(null, response.status);
      console.error("[YouTubeVideoService] API error:", error, { params });
      return { success: false, error };
    }

    const json = (await response.json()) as Record<string, unknown>;
    const items = json.items as Record<string, unknown>[] | undefined;

    if (!Array.isArray(items)) {
      return {
        success: false,
        error: { code: "INVALID_RESPONSE", message: "APIレスポンスにitemsが含まれていません", statusCode: response.status },
      };
    }

    const videos = items
      .map(transformVideoItem)
      .filter((v): v is VideoItem => v !== null);

    videoCache.set(cacheKey, videos, CACHE_TTL_MS);
    return { success: true, data: videos };
  } catch (error) {
    const apiError = classifyError(error, null);
    console.error("[YouTubeVideoService] fetchPopularVideos error:", apiError, { params });
    return { success: false, error: apiError };
  }
}

/** ジャンル別動画検索: YouTube search.list API (q パラメータで絞り込み) */
export async function searchByGenre(params: {
  genreId: string;
  searchQuery: string;
  maxResults: number;
  regionCode: string;
}): Promise<VideoServiceResult<VideoItem[]>> {
  const cacheKey = `genre:${params.genreId}:${params.regionCode}:${params.maxResults}`;
  const cached = videoCache.get<VideoItem[]>(cacheKey);
  if (cached) return { success: true, data: cached };

  try {
    const url = new URL(`${YOUTUBE_API_BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("q", params.searchQuery);
    url.searchParams.set("order", "viewCount");
    url.searchParams.set("regionCode", params.regionCode);
    url.searchParams.set("relevanceLanguage", "ja");
    url.searchParams.set("maxResults", String(params.maxResults));
    url.searchParams.set("key", getApiKey());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = classifyError(null, response.status);
      console.error("[YouTubeVideoService] API error:", error, { params });
      return { success: false, error };
    }

    const json = (await response.json()) as Record<string, unknown>;
    const items = json.items as Record<string, unknown>[] | undefined;

    if (!Array.isArray(items)) {
      return {
        success: false,
        error: { code: "INVALID_RESPONSE", message: "APIレスポンスにitemsが含まれていません", statusCode: response.status },
      };
    }

    const videos = items
      .map(transformVideoItem)
      .filter((v): v is VideoItem => v !== null);

    videoCache.set(cacheKey, videos, CACHE_TTL_MS);
    return { success: true, data: videos };
  } catch (error) {
    const apiError = classifyError(error, null);
    console.error("[YouTubeVideoService] searchByGenre error:", apiError, { params });
    return { success: false, error: apiError };
  }
}
