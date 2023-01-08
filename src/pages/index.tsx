import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { useState } from "react";
import { getRandomValues } from "crypto";
import Image from "next/image";
import { debug } from "console";
import { number } from "zod";
import { PokemonSprites } from "pokenode-ts";

type RoundestResult = {
  data:
    | {
        success: boolean;
        roundest: {
          name: string;
          id: number;
          votes: number;
          sprites: PokemonSprites;
        }[];
      }
    | undefined;
};

const MAX_POKEDEX_ID = 493;
const getRandomPokemonIds: (exclude?: number) => number = (exclude) => {
  const pokedexId = Math.floor(Math.random() * MAX_POKEDEX_ID) + 1;

  if (pokedexId !== exclude) {
    return pokedexId;
  }

  return getRandomPokemonIds(exclude);
};

const getPokedexOptions = () => {
  const first = getRandomPokemonIds();
  const second = getRandomPokemonIds(first);

  return [first, second];
};

const Home: NextPage = () => {
  const [pokemonIds, setPokemonIds] = useState(getPokedexOptions());
  const [first = 1, second = 2] = pokemonIds;

  // const { data } = api.getPokemon.getRoundestPokemon.useQuery();
  const { data } = api.getPokemon.getRoundestPokemon.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const voteMutation = api.getPokemon.castVote.useMutation();

  const handleVote = (votedFor: number, votedAgainst: number) => {
    voteMutation.mutate({
      votedFor,
      votedAgainst,
    });

    setPokemonIds(getPokedexOptions());
  };

  return (
    <>
      <Head>
        <title>Roundest</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#023d6d] to-[#0d0f38]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-2xl font-extrabold tracking-tight text-white lg:text-5xl">
            Choose which Pokemon is more round
          </h1>
          <VotingBooth first={first} second={second} handleVote={handleVote} />
          <TopRoundest data={data} />
        </div>
      </main>
    </>
  );
};

export default Home;

type VotingBoothTypes = {
  first: number;
  second: number;
  handleVote: (votedFor: number, votedAgainst: number) => void;
};

const EmptyVotingBooth = () => {
  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-3 md:gap-4">
      <div className="flex h-72 w-56 max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"></div>
      <div className="text-center text-3xl font-bold text-white">VS</div>
      <div className="flex h-72 w-56 max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"></div>
    </div>
  );
};

const VotingBooth = ({ first, second, handleVote }: VotingBoothTypes) => {
  const p1 = api.getPokemon.getPokemonById.useQuery({ id: first });
  const p2 = api.getPokemon.getPokemonById.useQuery({ id: second });
  const p1SpritePath = p1.data?.sprites.other?.dream_world.front_default;
  const p2SpritePath = p2.data?.sprites.other?.dream_world.front_default;

  if (p1.isLoading || p2.isLoading) return <EmptyVotingBooth />;
  if (p1SpritePath == null || p2SpritePath == null) return <EmptyVotingBooth />;

  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-3 md:gap-4">
      <button
        className="flex h-72 max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
        onClick={() => handleVote(first, second)}
      >
        <h3 className="text-2xl font-bold capitalize">{p1.data?.name}</h3>
        <Image
          src={p1SpritePath}
          alt={`Pokemon: ${first}`}
          className="h-48 w-48"
          width={216}
          height={216}
        />
      </button>
      <div className="text-center text-3xl font-bold text-white">VS</div>
      <button
        className="flex h-72 max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
        onClick={() => handleVote(second, first)}
      >
        <h3 className="text-2xl font-bold capitalize">{p2.data?.name}</h3>
        <Image
          src={p2SpritePath}
          alt={`Pokemon: ${second}`}
          className="h-48 w-48"
          width={216}
          height={216}
        />
      </button>
    </div>
  );
};

const TopRoundest: React.FC<RoundestResult> = ({ data }) => {
  if (!data?.success) {
    return <div>ERROR</div>;
  }

  return (
    <section className="pt-12">
      <h2 className="text-xl font-extrabold tracking-tight text-white lg:text-4xl">
        Top 10 roundest pokemon
      </h2>
      <div className="flex flex-col items-center pt-4">
        {data.roundest.map((p) => (
          <div
            className="grid w-full grid-cols-3 items-center justify-center gap-2"
            key={p.id}
          >
            <Image
              src={p.sprites.other?.dream_world.front_default || ""}
              alt={`Pokemon ${p.id}`}
              className="h-9 w-9"
              height={40}
              width={40}
            />
            <span className="text-bold text-center text-lg capitalize text-white">
              {p.name}
            </span>
            <span className="text-bold text-end text-lg capitalize text-white">
              {p.votes}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
