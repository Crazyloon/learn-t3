import { z } from "zod";
import { PokemonClient } from "pokenode-ts";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const getPokemon = createTRPCRouter({
  getPokemonById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const api = new PokemonClient();
      const p = await api.getPokemonById(input.id);

      return { name: p.name, sprites: p.sprites };
    }),
});
