"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: price } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "price",
  });
  const [loadingLoogies, setLoadingLoogies] = useState(true);
  const [allLoogies, setAllLoogies] = useState<any[]>();

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "totalSupply",
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  const { data: contract } = useScaffoldContract({ contractName: "YourCollectible" });

  useEffect(() => {
    async function updateAllLoogies() {
      setLoadingLoogies(true);
      if (contract && totalSupply) {
        const collectibleUpdate = [];
        const startIndex = totalSupply - 1n;
        for (let tokenIndex = startIndex; tokenIndex >= 0; tokenIndex--) {
          try {
            const tokenId = await contract.read.tokenByIndex([tokenIndex]);
            const tokenURI = await contract.read.tokenURI([tokenId]);
            const jsonManifestString = atob(tokenURI.substring(29));

            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              collectibleUpdate.push({ id: tokenId, uri: tokenURI, ...jsonManifest });
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log("collectible update:", collectibleUpdate);
        setAllLoogies(collectibleUpdate);
      }
      setLoadingLoogies(false);
    }
    updateAllLoogies();
  }, [totalSupply, Boolean(contract)]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <Image alt="Loogie" src="/loogie.svg" className="" width={192} height={192} />
        <p className="block text-4xl font-bold"> Optimistic Loogies </p>
        <p className="block text-2xl mt-4 mb-2"> Loogies with a smile </p>
        <p>Only 3728 Optimistic Loogies available on a price curve increasing 0.2% with each new mint.</p>
        <button
          onClick={async () => {
            try {
              await writeContractAsync({
                functionName: "mintItem",
                value: price,
              });
            } catch (e) {
              console.error(e);
            }
          }}
          className="btn btn-primary"
          disabled={!connectedAddress || !price}
        >
          Mint now for {price ? (+formatEther(price)).toFixed(6) : "-"} ETH
        </button>
        <p> {3728n - (totalSupply || 0n)} Loogies left </p>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-4 p-8 flex justify-center items-center space-x-2">
        {loadingLoogies ? (
          <p className="">Loading...</p>
        ) : !allLoogies?.length ? (
          <p className="font-medium">No loogies minted</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
            {allLoogies.map(loogie => {
              return (
                <div
                  key={loogie.id}
                  className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl"
                >
                  <h2 className="">{loogie.name}</h2>
                  <Image src={loogie.image} alt={loogie.name} width={300} height={300} />
                  <p>{loogie.description}</p>
                  <Address address={loogie.owner} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
