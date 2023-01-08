import { createTRPCRouter } from "./trpc";
import { getPokemon } from "./routers/get-pokemon";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  getPokemon: getPokemon,
});

// export type definition of API
export type AppRouter = typeof appRouter;
