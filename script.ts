import { PrismaClient } from "@prisma/client";
import { PokemonClient } from "pokenode-ts";

const prisma = new PrismaClient();

async function main() {
  const prisma = new PrismaClient();
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

  interface VotedFor {
    votedFor: number;
  }
  interface PrismaResult {
    _count: VotedFor;
    votedFor: number;
  }

  console.log(top10roundest);

  const mapPokemon = async (roundestPokemon: PrismaResult) => {
    const pokemon = await pokeApi.getPokemonById(roundestPokemon.votedFor);
    return {
      name: pokemon.name,
      id: roundestPokemon.votedFor,
      votes: roundestPokemon._count.votedFor,
    };
  };
  const results = await Promise.all(top10roundest.map(mapPokemon));

  console.log(`top 10 roundest pokemon: ${JSON.stringify(results)}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
