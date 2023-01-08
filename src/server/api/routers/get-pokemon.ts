import { number, z } from "zod";
import { PokemonClient } from "pokenode-ts";
import { prisma } from "../../utils/prisma";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { resolve } from "path";

// Types of Prisma Results
interface Top10Result {
  _count: { votedFor: number };
  votedFor: number;
}

export const getPokemon = createTRPCRouter({
  getPokemonById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const api = new PokemonClient();

      const p = await api.getPokemonById(input.id);

      return { name: p.name, sprites: p.sprites };
    }),
  castVote: publicProcedure
    .input(
      z.object({
        votedFor: z.number(),
        votedAgainst: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const voteInDb = await prisma.votes.create({
        data: {
          ...input,
        },
      });

      return { success: true, vote: voteInDb };
    }),
  getRoundestPokemon: publicProcedure.query(async () => {
    const pokeApi = new PokemonClient();

    const top10roundest = await prisma.votes.groupBy({
      by: ["votedFor"],
      _count: {
        votedFor: true,
      },
      orderBy: {
        _count: {
          votedFor: "desc",
        },
      },
      take: 10,
    });

    const mapPokemon = async (roundestPokemon: Top10Result) => {
      const pokemon = await pokeApi.getPokemonById(roundestPokemon.votedFor);
      return {
        name: pokemon.name,
        id: roundestPokemon.votedFor,
        votes: roundestPokemon._count.votedFor,
        sprites: pokemon.sprites,
      };
    };
    const results = await Promise.all(top10roundest.map(mapPokemon));

    return { success: true, roundest: results };
  }),
});
