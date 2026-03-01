import { createTRPCRouter, baseProcedure } from "../init";
import { db } from "@/db";
import { genres } from "@/db/schemas/genres";

export const genreRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    return await db.select().from(genres);
  }),
});
