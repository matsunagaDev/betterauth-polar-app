/**
 * 動画 tRPC ルーター
 * @see .kiro/specs/youtube-video-grid/design.md - VideoRouter
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";
import { db } from "@/db";
import { users } from "@/db/schemas/auth";
import { genres } from "@/db/schemas/genres";
import { fetchPopularVideos, searchByGenre } from "@/lib/youtube/video-service";
import { getYouTubeParams } from "@/lib/youtube/genre-mapping";

const videoItemSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
  channelName: z.string(),
  publishedAt: z.string(),
  viewCount: z.string().nullable(),
});

const popularVideosInputSchema = z
  .object({
    maxResults: z.number().min(1).max(50).default(12),
  })
  .optional();

const genreVideosInputSchema = z
  .object({
    maxResults: z.number().min(1).max(50).default(8),
  })
  .optional();

export const videoRouter = createTRPCRouter({
  // 人気動画取得（認証不要）
  popular: baseProcedure
    .input(popularVideosInputSchema)
    .output(z.object({ videos: z.array(videoItemSchema) }))
    .query(async ({ input }) => {
      const maxResults = input?.maxResults ?? 12;

      const result = await fetchPopularVideos({
        maxResults,
        regionCode: "JP",
      });

      if (!result.success) {
        if (result.error.code === "QUOTA_EXCEEDED") {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: result.error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
        });
      }

      return { videos: result.data };
    }),

  // ジャンル別動画取得（認証必須）
  byGenres: protectedProcedure
    .input(genreVideosInputSchema)
    .output(
      z.object({
        sections: z.array(
          z.object({
            genreId: z.string(),
            genreLabel: z.string(),
            videos: z.array(videoItemSchema),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const maxResults = input?.maxResults ?? 8;

      const user = await db
        .select({ genres: users.genres })
        .from(users)
        .where(eq(users.id, ctx.auth.user.id))
        .get();

      const userGenreIds: string[] = user?.genres
        ? (JSON.parse(user.genres) as string[])
        : [];

      // ジャンル未選択時は人気動画をフォールバック
      if (userGenreIds.length === 0) {
        const result = await fetchPopularVideos({
          maxResults,
          regionCode: "JP",
        });

        if (!result.success) {
          return { sections: [] };
        }

        return {
          sections: [
            {
              genreId: "popular",
              genreLabel: "おすすめ",
              videos: result.data,
            },
          ],
        };
      }

      const allGenres = await db.select().from(genres);
      const genreMap = new Map(allGenres.map((g) => [g.id, g.label]));

      const sectionPromises = userGenreIds.map(async (genreId) => {
        const params = getYouTubeParams(genreId);
        const result = await searchByGenre({
          genreId,
          searchQuery: params.searchQuery,
          maxResults,
          regionCode: "JP",
        });

        return {
          genreId,
          genreLabel: genreMap.get(genreId) ?? genreId,
          videos: result.success ? result.data : [],
        };
      });

      const sections = await Promise.all(sectionPromises);

      return { sections };
    }),
});
