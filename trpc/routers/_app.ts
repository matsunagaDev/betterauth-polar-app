import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { genreRouter } from './genre';
import { onboardingRouter } from './onboarding';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  genre: genreRouter,
  onboarding: onboardingRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;