import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { users } from "@/db/schemas/auth";
import { genres } from "@/db/schemas/genres";

export const onboardingRouter = createTRPCRouter({
  // オンボーディング状態取得
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await db
      .select({
        onboardingCompleted: users.onboardingCompleted,
        genres: users.genres,
      })
      .from(users)
      .where(eq(users.id, ctx.auth.user.id))
      .get();

    return {
      completed: user?.onboardingCompleted ?? false,
      genres: user?.genres ? (JSON.parse(user.genres) as string[]) : [],
    };
  }),

  // オンボーディング完了（ジャンル保存）
  complete: protectedProcedure
    .input(
      z.object({
        genres: z.array(z.string()).max(3, "ジャンルは最大3つまでです"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // ジャンル ID のバリデーション（空配列はスキップとして許容）
      if (input.genres.length > 0) {
        const validGenres = await db.select({ id: genres.id }).from(genres);
        const validIds = validGenres.map((g) => g.id);
        const invalidGenres = input.genres.filter(
          (id) => !validIds.includes(id)
        );
        if (invalidGenres.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `不正なジャンル ID: ${invalidGenres.join(", ")}`,
          });
        }
      }

      await db
        .update(users)
        .set({
          onboardingCompleted: true,
          genres: JSON.stringify(input.genres),
        })
        .where(eq(users.id, ctx.auth.user.id));

      return { success: true };
    }),
});
