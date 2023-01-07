import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { useState } from "react";
import { getRandomValues } from "crypto";
import Image from "next/image";

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

function handleVote(id: number) {
  return;
}

const Home: NextPage = () => {
  const [pokemonIds, setPokemonIds] = useState(getPokedexOptions());
  const [first = 1, second = 2] = pokemonIds;

  const p1 = api.getPokemon.getPokemonById.useQuery({ id: first });
  const p2 = api.getPokemon.getPokemonById.useQuery({ id: second });
  const p1SpritePath = p1.data?.sprites.front_default;
  const p2SpritePath = p2.data?.sprites.front_default;

  if (p1.isLoading || p2.isLoading) return null;

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
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-3 md:gap-4">
            <button
              className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              onClick={() => handleVote(first)}
            >
              <h3 className="text-2xl font-bold capitalize">{p1.data?.name}</h3>
              <img
                src={p1SpritePath}
                alt={`Pokemon: ${first}`}
                className="w-48"
              />
            </button>
            <div className="text-center text-3xl font-bold text-white">VS</div>
            <button
              className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              onClick={() => handleVote(second)}
            >
              <h3 className="text-2xl font-bold capitalize">{p2.data?.name}</h3>
              <img
                src={p2SpritePath}
                alt={`Pokemon: ${second}`}
                className="w-48"
              />
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
